import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";

const BASE = "/api/labs/ssti";

type SstiResult = {
  success: boolean;
  message?: string;
  rendered?: string;
  warning?: string;
  _debug?: { message: string };
};

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

  const presets = [
    { label: "通常", template: "Hello, {{name}}! Today is {{date}}.", name: "Taro" },
    { label: "コード実行", template: "Result: {{7*7}}", name: "test" },
    { label: "環境変数", template: "{{JSON.stringify(process.env).substring(0,200)}}", name: "test" },
  ];

  return (
    <div>
      <Textarea label="テンプレート:" value={template} onChange={(e) => setTemplate(e.target.value)} mono rows={3} className="mb-2" />
      <Input label="name変数:" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mb-2" />
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <Button key={p.label} variant="ghost" size="sm" onClick={() => { setTemplate(p.template); setName(p.name); }}>
            {p.label}
          </Button>
        ))}
      </div>
      <FetchButton onClick={() => onRender(template, name)} disabled={isLoading}>
        レンダリング
      </FetchButton>

      {result && (
        <Alert variant={result.success ? "success" : "error"} className="mt-2">
          {result.rendered && (
            <div>
              <div className="text-xs font-bold">レンダリング結果:</div>
              <pre className="text-xs bg-bg-secondary p-2 rounded mt-1 overflow-auto">{result.rendered}</pre>
            </div>
          )}
          {result.warning && <div className="text-xs mt-1">{result.warning}</div>}
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result._debug && <div className="mt-2 text-xs italic opacity-70">{result._debug.message}</div>}
        </Alert>
      )}
    </div>
  );
}

export function Ssti() {
  const [vulnResult, setVulnResult] = useState<SstiResult | null>(null);
  const [secureResult, setSecureResult] = useState<SstiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRender = async (mode: "vulnerable" | "secure", template: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, name }),
      });
      const data: SstiResult = await res.json();
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
      title="SSTI (Server-Side Template Injection)"
      subtitle="テンプレートエンジンでユーザー入力が実行される"
      description="テンプレートエンジンがユーザー入力をテンプレート式として評価する場合、{{7*7}}のような式が実行され、さらに任意のコード実行（RCE）につながる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<SstiPanel mode="vulnerable" result={vulnResult} isLoading={loading} onRender={(t, n) => handleRender("vulnerable", t, n)} />}
        secureContent={<SstiPanel mode="secure" result={secureResult} isLoading={loading} onRender={(t, n) => handleRender("secure", t, n)} />}
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
