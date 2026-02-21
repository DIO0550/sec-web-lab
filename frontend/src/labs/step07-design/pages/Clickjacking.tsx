import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/clickjacking";

type ClickResult = {
  success: boolean;
  message?: string;
  _debug?: { message: string; headers?: Record<string, string> };
  protectedHeaders?: Record<string, string>;
};

function ClickPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  result: ClickResult | null;
  isLoading: boolean;
  onTest: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onTest} disabled={isLoading}>
        ヘッダー確認
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded bg-[#f5f5f5] border`}>
          <div className="font-bold text-sm mb-2">レスポンスヘッダー</div>
          {result._debug?.headers && (
            <pre className="text-xs overflow-auto">
              {Object.entries(result._debug.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}
            </pre>
          )}
          {result.protectedHeaders && (
            <pre className="text-xs overflow-auto">
              {Object.entries(result.protectedHeaders).map(([k, v]) => `${k}: ${v}`).join("\n")}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>
          )}
        </div>
      )}

      <div className="mt-3 p-3 border border-dashed border-[#ccc] rounded">
        <div className="text-[13px] font-bold mb-1">攻撃シミュレーション</div>
        <p className="text-xs text-[#666]">
          攻撃者は透明なiframeの下にボタンを配置します。ユーザーは「当選しました！」と書かれたボタンをクリックしますが、
          実際には裏のiframeの「送金実行」ボタンをクリックしています。
        </p>
        <div className="relative bg-[#eee] p-4 rounded mt-2 text-center">
          <div className="text-sm">おめでとうございます！当選しました！</div>
          <button className="mt-2 px-4 py-2 bg-[#ff6600] text-white rounded cursor-pointer">
            賞品を受け取る
          </button>
          <div className="text-[10px] text-[#888] mt-2">
            (実際には裏の iframe で「送金実行」が押される)
          </div>
        </div>
      </div>
    </div>
  );
}

export function Clickjacking() {
  const [vulnResult, setVulnResult] = useState<ClickResult | null>(null);
  const [secureResult, setSecureResult] = useState<ClickResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/target`);
      const data: ClickResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="クリックジャッキング"
      subtitle="透明iframeによるUI偽装"
      description="X-Frame-Optionsヘッダーが未設定の場合、攻撃者は透明なiframeにターゲットページを埋め込み、ユーザーに意図しない操作（送金、設定変更等）をさせることができます。"
    >
      <ComparisonPanel
        vulnerableContent={<ClickPanel mode="vulnerable" result={vulnResult} isLoading={loading} onTest={() => handleTest("vulnerable")} />}
        secureContent={<ClickPanel mode="secure" result={secureResult} isLoading={loading} onTest={() => handleTest("secure")} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: X-Frame-Options ヘッダーが設定されていないか</li>
          <li>安全版: X-Frame-Options: DENY と CSP frame-ancestors が設定されているか</li>
          <li>クリックジャッキングの攻撃手法と対策を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
