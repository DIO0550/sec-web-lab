import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/ssti";

type SstiResult = {
  success: boolean;
  message?: string;
  rendered?: string;
  warning?: string;
  _debug?: { message: string };
};

const presets = [
  { label: "通常", template: "Hello, {{name}}! Today is {{date}}.", name: "Taro" },
  { label: "コード実行", template: "Result: {{7*7}}", name: "test" },
  { label: "環境変数", template: "{{JSON.stringify(process.env).substring(0,200)}}", name: "test" },
];

function SstiPanel({
  mode,
  result,
  isLoading,
  onRender,
}: {
  mode: "vulnerable" | "secure";
  result: SstiResult | null;
  isLoading: boolean;
  onRender: (template: string, name: string) => void;
}) {
  const [template, setTemplate] = useState("Hello, {{name}}! Today is {{date}}.");
  const [name, setName] = useState("Taro");

  return (
    <div>
      <Textarea label="テンプレート:" value={template} onChange={(e) => setTemplate(e.target.value)} mono rows={3} className="mb-2" />
      <Input label="name変数:" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mb-2" />
      <PresetButtons
        presets={presets}
        onSelect={(p) => { setTemplate(p.template); setName(p.name); }}
        className="mb-2"
      />
      <FetchButton onClick={() => onRender(template, name)} disabled={isLoading}>
        レンダリング
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} className="mt-2">
          {result?.rendered && (
            <div>
              <div className="text-xs font-bold">レンダリング結果:</div>
              <pre className="text-xs bg-bg-secondary p-2 rounded mt-1 overflow-auto">{result.rendered}</pre>
            </div>
          )}
          {result?.warning && <div className="text-xs mt-1">{result.warning}</div>}
          {result?.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result?._debug && <div className="mt-2 text-xs italic opacity-70">{result._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function Ssti() {
  const render = useComparisonFetch<SstiResult>(BASE);

  const handleRender = async (mode: "vulnerable" | "secure", template: string, name: string) => {
    await render.postJson(mode, "/render", { template, name }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="SSTI (Server-Side Template Injection)"
      subtitle="テンプレートエンジンでユーザー入力が実行される"
      description="テンプレートエンジンがユーザー入力をテンプレート式として評価する場合、{{7*7}}のような式が実行され、さらに任意のコード実行（RCE）につながる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<SstiPanel mode="vulnerable" result={render.vulnerable} isLoading={render.loading} onRender={(t, n) => handleRender("vulnerable", t, n)} />}
        secureContent={<SstiPanel mode="secure" result={render.secure} isLoading={render.loading} onRender={(t, n) => handleRender("secure", t, n)} />}
      />

      <CheckpointBox>
        <ul>
          <li>{"脆弱版: {{7*7}} で 49 が表示されるか"}</li>
          <li>安全版: テンプレート式の実行が拒否されるか</li>
          <li>ユーザー入力をテンプレートの「データ」として扱う重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
