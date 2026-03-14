import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { PresetButtons } from "@/components/PresetButtons";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/eval-injection";

type CalcResult = {
  success: boolean;
  message?: string;
  expression?: string;
  result?: string;
  _debug?: { message: string; type?: string };
};

const presets = [
  { label: "通常の計算", value: "1 + 2 * 3" },
  { label: "環境変数", value: "JSON.stringify(process.env)" },
  { label: "コード実行", value: "require('child_process').execSync('whoami').toString()" },
  { label: "ファイル読取", value: "require('fs').readFileSync('/etc/hostname','utf8')" },
];

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

  return (
    <div>
      <Input label="数式 / コード:" value={expression} onChange={(e) => setExpression(e.target.value)} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setExpression(p.value)} className="mb-2" />
      <FetchButton onClick={() => onCalc(expression)} disabled={isLoading}>
        計算実行
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? "実行結果" : "エラー"} className="mt-2">
          {result?.expression && <div className="text-xs text-text-secondary mt-1">式: {result?.expression}</div>}
          {result?.result && (
            <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto">{result?.result}</pre>
          )}
          {result?.message && <div className="text-[13px] mt-1">{result?.message}</div>}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">{result?._debug.message}</div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function EvalInjection() {
  const result = useComparisonFetch<CalcResult>(BASE);

  const handleCalc = async (mode: "vulnerable" | "secure", expression: string) => {
    await result.postJson(mode, "/calculate", { expression }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="evalインジェクション"
      subtitle="ユーザー入力をコードとして実行してしまう"
      description="eval()やnew Function()でユーザー入力を直接実行すると、攻撃者が任意のコードをサーバー上で実行（RCE）できる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <CalcPanel mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onCalc={(e) => handleCalc("vulnerable", e)} />
        }
        secureContent={
          <CalcPanel mode="secure" result={result.secure} isLoading={result.loading} onCalc={(e) => handleCalc("secure", e)} />
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
