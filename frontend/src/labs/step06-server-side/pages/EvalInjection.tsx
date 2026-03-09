import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";

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
      <Input label="数式 / コード:" value={expression} onChange={(e) => setExpression(e.target.value)} className="mb-2" />
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <Button key={p.label} variant="ghost" size="sm" onClick={() => setExpression(p.value)}>
            {p.label}
          </Button>
        ))}
      </div>
      <FetchButton onClick={() => onCalc(expression)} disabled={isLoading}>
        計算実行
      </FetchButton>

      {result && (
        <Alert variant={result.success ? "success" : "error"} title={result.success ? "実行結果" : "エラー"} className="mt-2">
          {result.expression && <div className="text-xs text-[#666] mt-1">式: {result.expression}</div>}
          {result.result && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">{result.result}</pre>
          )}
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>
          )}
        </Alert>
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
