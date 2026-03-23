import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";

const BASE = "/api/labs/redos";

type RedosResult = {
  success: boolean;
  message?: string;
  matched?: boolean;
  elapsed?: string;
  _debug?: { message: string; pattern?: string; inputLength?: number };
};

const presets = [
  { label: "通常(マッチ)", value: "aaaaaa" },
  { label: "通常(不一致)", value: "aaaaab" },
  { label: "ReDoS(短)", value: "aaaaaaaaaaaaaaab" },
  { label: "ReDoS(長)", value: "aaaaaaaaaaaaaaaaaaaaaaaaaab" },
];

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

  return (
    <div>
      <Input label="入力文字列:" type="text" value={input} onChange={(e) => setInput(e.target.value)} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setInput(p.value)} className="mb-2" />
      <FetchButton onClick={() => onValidate(input)} disabled={isLoading}>
        バリデーション実行
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} className="mt-2">
          <div className="text-sm font-bold">
            {result?.matched ? "マッチ" : "不一致"} — {result?.elapsed}
          </div>
          {result?.message && <div className="text-sm mt-1">{result.message}</div>}
          {result?._debug && (
            <div className="mt-2 text-xs italic opacity-70">
              {result._debug.message}
              {result._debug.pattern && <div>パターン: {result._debug.pattern}</div>}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function Redos() {
  const validate = useComparisonFetch<RedosResult>(BASE);

  const handleValidate = async (mode: "vulnerable" | "secure", input: string) => {
    await validate.postJson(mode, "/validate", { input }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="ReDoS (正規表現DoS)"
      subtitle="危険な正規表現パターンによるCPUリソース枯渇"
      description="(a+)+$ のような量指定子がネストした正規表現に、不一致する入力を与えるとバックトラッキングが指数関数的に増加し、サーバーのCPUリソースが枯渇する脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<RedosPanel mode="vulnerable" result={validate.vulnerable} isLoading={validate.loading} onValidate={(i) => handleValidate("vulnerable", i)} />}
        secureContent={<RedosPanel mode="secure" result={validate.secure} isLoading={validate.loading} onValidate={(i) => handleValidate("secure", i)} />}
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
