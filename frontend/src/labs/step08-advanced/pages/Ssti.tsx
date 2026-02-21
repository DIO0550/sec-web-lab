import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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
      <div className="mb-2">
        <label className="text-[13px] block">テンプレート:</label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-sm font-mono"
          rows={3}
        />
      </div>
      <div className="mb-2">
        <label className="text-[13px] block">name変数:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full" />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => { setTemplate(p.template); setName(p.name); }} className="text-[11px] py-0.5 px-2 cursor-pointer">
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onRender(template, name)} disabled={isLoading}>
        レンダリング
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          {result.rendered && (
            <div>
              <div className="text-xs font-bold">レンダリング結果:</div>
              <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-1 overflow-auto">{result.rendered}</pre>
            </div>
          )}
          {result.warning && <div className="text-xs text-[#ff6600] mt-1">{result.warning}</div>}
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result._debug && <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>}
        </div>
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
