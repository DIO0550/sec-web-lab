import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Input } from "@/components/Input";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";

const BASE = "/api/labs/csp";

type CspResult = { success: boolean; html?: string; cspHeader?: string; _debug?: { message: string; xssPayload?: string; risks?: string[] } };

const presets = [
  { label: "通常", value: "World" },
  { label: "XSSペイロード", value: '<script>alert("XSS")</script>' },
  { label: "imgタグ", value: '<img src=x onerror=alert(1)>' },
];

function CspPanel({ mode, result, isLoading, onTest }: { mode: "vulnerable" | "secure"; result: CspResult | null; isLoading: boolean; onTest: (name: string) => void }) {
  const [name, setName] = useState("World");

  return (
    <div>
      <Input label="名前（入力値）:" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setName(p.value)} className="mb-2" />
      <FetchButton onClick={() => onTest(name)} disabled={isLoading}>ページ取得</FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div className="mt-2 p-3 rounded bg-bg-secondary border">
          {result?.html && (
            <div>
              <div className="text-xs font-bold">生成HTML:</div>
              <pre className="text-xs bg-bg-primary p-2 rounded mt-1 overflow-auto">{result.html}</pre>
            </div>
          )}
          <div className="mt-2">
            <div className="text-xs font-bold">CSPヘッダー:</div>
            <pre className="text-xs bg-bg-primary p-2 rounded mt-1 overflow-auto break-all">{result?.cspHeader || "(未設定)"}</pre>
          </div>
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">{result._debug.message}
              {result._debug.risks && <ul className="mt-1">{result._debug.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>}
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

export function Csp() {
  const csp = useComparisonFetch<CspResult>(BASE);

  const handleTest = async (mode: "vulnerable" | "secure", name: string) => {
    await csp.run(mode, `/page?name=${encodeURIComponent(name)}`, undefined, () => ({
      success: false,
    } as CspResult));
  };

  return (
    <LabLayout title="CSP (Content Security Policy)" subtitle="XSS対策としてのCSP設定" description="Content Security Policyヘッダーを設定することで、XSSが存在してもインラインスクリプトの実行や外部リソースの読み込みをブラウザレベルでブロックできる防御策を体験します。">
      <ComparisonPanel
        vulnerableContent={<CspPanel mode="vulnerable" result={csp.vulnerable} isLoading={csp.loading} onTest={(n) => handleTest("vulnerable", n)} />}
        secureContent={<CspPanel mode="secure" result={csp.secure} isLoading={csp.loading} onTest={(n) => handleTest("secure", n)} />}
      />
      <CheckpointBox>
        <ul>
          <li>脆弱版: CSPヘッダーが未設定で、XSSペイロードが実行可能な状態か</li>
          <li>安全版: CSPヘッダーが設定され、インラインスクリプトがブロックされるか</li>
          <li>CSPはXSSの「緩和策」であり、根本対策（出力エスケープ）と併用すべきことを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
