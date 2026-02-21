import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/race-condition";

type PurchaseResult = {
  success: boolean;
  message: string;
  stock?: number;
  _debug?: { message: string; totalPurchases?: number; currentStock?: number };
};

type StockInfo = { stock: number; purchases: number };

function RacePanel({
  mode,
  results,
  stockInfo,
  isLoading,
  onPurchase,
  onRace,
  onCheckStock,
}: {
  mode: "vulnerable" | "secure";
  results: PurchaseResult[];
  stockInfo: StockInfo | null;
  isLoading: boolean;
  onPurchase: () => void;
  onRace: () => void;
  onCheckStock: () => void;
}) {
  return (
    <div>
      {stockInfo && (
        <div className="text-sm mb-2 p-2 bg-[#f5f5f5] rounded">
          在庫: {stockInfo.stock}個 / 購入数: {stockInfo.purchases}
        </div>
      )}
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={onCheckStock} disabled={isLoading}>在庫確認</FetchButton>
        <FetchButton onClick={onPurchase} disabled={isLoading}>1回購入</FetchButton>
        <FetchButton onClick={onRace} disabled={isLoading}>同時5回購入</FetchButton>
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-[200px] overflow-auto">
          {results.map((r, i) => (
            <div key={i} className={`text-xs p-1 mb-1 rounded ${r.success ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}`}>
              #{i + 1}: {r.message} {r.stock !== undefined && `(残り: ${r.stock})`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RaceCondition() {
  const [vulnResults, setVulnResults] = useState<PurchaseResult[]>([]);
  const [secureResults, setSecureResults] = useState<PurchaseResult[]>([]);
  const [vulnStock, setVulnStock] = useState<StockInfo | null>(null);
  const [secureStock, setSecureStock] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStock = async (mode: "vulnerable" | "secure") => {
    const res = await fetch(`${BASE}/${mode}/stock`);
    const data: StockInfo = await res.json();
    if (mode === "vulnerable") setVulnStock(data);
    else setSecureStock(data);
  };

  const purchase = async (mode: "vulnerable" | "secure") => {
    const res = await fetch(`${BASE}/${mode}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "1" }),
    });
    return res.json() as Promise<PurchaseResult>;
  };

  const handlePurchase = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const data = await purchase(mode);
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
      else setSecureResults((prev) => [...prev, data]);
      await checkStock(mode);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, err]);
      else setSecureResults((prev) => [...prev, err]);
    }
    setLoading(false);
  };

  const handleRace = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    // 5つの購入リクエストを同時に送信
    const promises = Array.from({ length: 5 }, () => purchase(mode).catch((e) => ({ success: false, message: (e as Error).message })));
    const results = await Promise.all(promises);
    if (mode === "vulnerable") setVulnResults((prev) => [...prev, ...results]);
    else setSecureResults((prev) => [...prev, ...results]);
    await checkStock(mode);
    setLoading(false);
  };

  return (
    <LabLayout
      title="レースコンディション"
      subtitle="同時実行で在庫チェックと在庫更新の間を突く"
      description="在庫1個の商品に対して複数の購入リクエストを同時に送信すると、在庫チェックと在庫更新の間のタイミング差を突いて、在庫以上の購入が成功してしまう脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <RacePanel mode="vulnerable" results={vulnResults} stockInfo={vulnStock} isLoading={loading}
            onPurchase={() => handlePurchase("vulnerable")} onRace={() => handleRace("vulnerable")} onCheckStock={() => checkStock("vulnerable")} />
        }
        secureContent={
          <RacePanel mode="secure" results={secureResults} stockInfo={secureStock} isLoading={loading}
            onPurchase={() => handlePurchase("secure")} onRace={() => handleRace("secure")} onCheckStock={() => checkStock("secure")} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 在庫1個に対して同時5回購入で複数が成功するか</li>
          <li>安全版: ミューテックスで排他制御され、1回のみ成功するか</li>
          <li>本番DBではSELECT FOR UPDATEやトランザクション分離レベルで対策することを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
