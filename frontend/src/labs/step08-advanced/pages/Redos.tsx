import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/redos";

type RedosResult = {
  success: boolean;
  message?: string;
  matched?: boolean;
  elapsed?: string;
  _debug?: { message: string; pattern?: string; inputLength?: number };
};

function RedosPanel({
  mode,
  result,
  isLoading,
  onValidate,
}: {
  mode: "vulnerable" | "secure";
  result: RedosResult | null;
  isLoading: boolean;
  onValidate: (input: string) => void;
}) {
  const [input, setInput] = useState("aaaaaa");

  const presets = [
    { label: "通常(マッチ)", value: "aaaaaa" },
    { label: "通常(不一致)", value: "aaaaab" },
    { label: "ReDoS(短)", value: "aaaaaaaaaaaaaaab" },
    { label: "ReDoS(長)", value: "aaaaaaaaaaaaaaaaaaaaaaaaaab" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">入力文字列:</label>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm font-mono" />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setInput(p.value)} className="text-[11px] py-0.5 px-2 cursor-pointer">
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onValidate(input)} disabled={isLoading}>
        バリデーション実行
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className="text-sm font-bold">
            {result.matched ? "マッチ" : "不一致"} — {result.elapsed}
          </div>
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              {result._debug.message}
              {result._debug.pattern && <div>パターン: {result._debug.pattern}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Redos() {
  const [vulnResult, setVulnResult] = useState<RedosResult | null>(null);
  const [secureResult, setSecureResult] = useState<RedosResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async (mode: "vulnerable" | "secure", input: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data: RedosResult = await res.json();
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
      title="ReDoS (正規表現DoS)"
      subtitle="危険な正規表現パターンによるCPUリソース枯渇"
      description="(a+)+$ のような量指定子がネストした正規表現に、不一致する入力を与えるとバックトラッキングが指数関数的に増加し、サーバーのCPUリソースが枯渇する脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<RedosPanel mode="vulnerable" result={vulnResult} isLoading={loading} onValidate={(i) => handleValidate("vulnerable", i)} />}
        secureContent={<RedosPanel mode="secure" result={secureResult} isLoading={loading} onValidate={(i) => handleValidate("secure", i)} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: "aaa...ab" の入力で処理時間が急増するか</li>
          <li>安全版: 同じ入力でも高速に処理されるか</li>
          <li>量指定子のネスト回避と入力長制限の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
