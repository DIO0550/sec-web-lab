import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/eval-injection";

type CalcResult = {
  success: boolean;
  message?: string;
  expression?: string;
  result?: string;
  _debug?: { message: string; type?: string };
};

function CalcPanel({
  mode,
  result,
  isLoading,
  onCalc,
}: {
  mode: "vulnerable" | "secure";
  result: CalcResult | null;
  isLoading: boolean;
  onCalc: (expression: string) => void;
}) {
  const [expression, setExpression] = useState("1 + 2 * 3");

  const presets = [
    { label: "通常の計算", value: "1 + 2 * 3" },
    { label: "環境変数", value: "JSON.stringify(process.env)" },
    { label: "コード実行", value: "require('child_process').execSync('whoami').toString()" },
    { label: "ファイル読取", value: "require('fs').readFileSync('/etc/hostname','utf8')" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">数式 / コード:</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-sm font-mono"
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setExpression(p.value)} className="text-[11px] py-0.5 px-2 cursor-pointer">
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onCalc(expression)} disabled={isLoading}>
        計算実行
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "実行結果" : "エラー"}
          </div>
          {result.expression && <div className="text-xs text-[#666] mt-1">式: {result.expression}</div>}
          {result.result && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">{result.result}</pre>
          )}
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function EvalInjection() {
  const [vulnResult, setVulnResult] = useState<CalcResult | null>(null);
  const [secureResult, setSecureResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalc = async (mode: "vulnerable" | "secure", expression: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression }),
      });
      const data: CalcResult = await res.json();
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
      title="evalインジェクション"
      subtitle="ユーザー入力をコードとして実行してしまう"
      description="eval()やnew Function()でユーザー入力を直接実行すると、攻撃者が任意のコードをサーバー上で実行（RCE）できる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <CalcPanel mode="vulnerable" result={vulnResult} isLoading={loading} onCalc={(e) => handleCalc("vulnerable", e)} />
        }
        secureContent={
          <CalcPanel mode="secure" result={secureResult} isLoading={loading} onCalc={(e) => handleCalc("secure", e)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: process.env やファイル読み取りが実行できるか</li>
          <li>安全版: 数式以外の入力が拒否されるか</li>
          <li>eval()の危険性と、安全な代替手段を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
