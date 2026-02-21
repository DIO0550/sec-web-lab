import { useState, useEffect } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/business-logic";

type OrderResult = {
  success: boolean;
  message: string;
  order?: { product: string; quantity: number; unitPrice: number; total: number; balance: number };
  _debug?: { message: string; risks?: string[] };
};

function OrderPanel({
  mode,
  results,
  isLoading,
  onOrder,
}: {
  mode: "vulnerable" | "secure";
  results: OrderResult[];
  isLoading: boolean;
  onOrder: (productId: string, quantity: number, price?: number) => void;
}) {
  const [productId, setProductId] = useState("1");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const presets = [
    { label: "通常購入", productId: "2", quantity: "1", price: "" },
    { label: "負の数量", productId: "2", quantity: "-5", price: "" },
    { label: "価格改ざん", productId: "1", quantity: "1", price: "0" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">商品ID:</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded">
          <option value="1">ノートPC (¥150,000)</option>
          <option value="2">マウス (¥3,000)</option>
          <option value="3">キーボード (¥8,000)</option>
        </select>
      </div>
      <div className="mb-2">
        <label className="text-[13px] block">数量:</label>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-24" />
      </div>
      {mode === "vulnerable" && (
        <div className="mb-2">
          <label className="text-[13px] block">価格（改ざん用）:</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-24" placeholder="空=サーバー価格" />
        </div>
      )}
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => { setProductId(p.productId); setQuantity(p.quantity); setPrice(p.price); }} className="text-[11px] py-0.5 px-2 cursor-pointer">
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onOrder(productId, Number(quantity), price ? Number(price) : undefined)} disabled={isLoading}>
        注文実行
      </FetchButton>

      {results.length > 0 && (
        <div className="mt-2 max-h-[250px] overflow-auto">
          {results.map((r, i) => (
            <div key={i} className={`text-xs p-2 mb-1 rounded ${r.success ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}`}>
              <div>{r.message}</div>
              {r.order && <div className="font-mono mt-1">残高: ¥{r.order.balance.toLocaleString()} (合計: ¥{r.order.total.toLocaleString()})</div>}
              {r._debug && <div className="text-[#888] italic mt-1">{r._debug.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BusinessLogic() {
  const [vulnResults, setVulnResults] = useState<OrderResult[]>([]);
  const [secureResults, setSecureResults] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOrder = async (mode: "vulnerable" | "secure", productId: string, quantity: number, price?: number) => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { productId, quantity };
      if (price !== undefined && mode === "vulnerable") payload.price = price;
      const res = await fetch(`${BASE}/${mode}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: OrderResult = await res.json();
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
      else setSecureResults((prev) => [...prev, data]);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, err]);
      else setSecureResults((prev) => [...prev, err]);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="ビジネスロジックの欠陥"
      subtitle="数量や価格の不正操作で意図しない取引が成立"
      description="数量に負の値を入力して残高を増やしたり、クライアントから送信された価格を信頼して無料購入したりできる、ビジネスロジックの欠陥を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<OrderPanel mode="vulnerable" results={vulnResults} isLoading={loading} onOrder={(p, q, pr) => handleOrder("vulnerable", p, q, pr)} />}
        secureContent={<OrderPanel mode="secure" results={secureResults} isLoading={loading} onOrder={(p, q) => handleOrder("secure", p, q)} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 数量 -5 で残高が増えるか（マイナス掛け算）</li>
          <li>脆弱版: 価格 0 で無料購入できるか</li>
          <li>安全版: サーバー側で価格を参照し、数量の範囲チェックがされているか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
