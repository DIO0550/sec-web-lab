import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/csp";

type CspResult = { success: boolean; html?: string; cspHeader?: string; _debug?: { message: string; xssPayload?: string; risks?: string[] } };

function CspPanel({ mode, result, isLoading, onTest }: { mode: "vulnerable" | "secure"; result: CspResult | null; isLoading: boolean; onTest: (name: string) => void }) {
  const [name, setName] = useState("World");

  const presets = [
    { label: "通常", value: "World" },
    { label: "XSSペイロード", value: '<script>alert("XSS")</script>' },
    { label: "imgタグ", value: '<img src=x onerror=alert(1)>' },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">名前（入力値）:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm" />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setName(p.value)} className="text-[11px] py-0.5 px-2 cursor-pointer">{p.label}</button>
        ))}
      </div>
      <FetchButton onClick={() => onTest(name)} disabled={isLoading}>ページ取得</FetchButton>

      {result && (
        <div className="mt-2 p-3 rounded bg-[#f5f5f5] border">
          {result.html && (
            <div>
              <div className="text-xs font-bold">生成HTML:</div>
              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">{result.html}</pre>
            </div>
          )}
          <div className="mt-2">
            <div className="text-xs font-bold">CSPヘッダー:</div>
            <pre className="text-[10px] bg-white p-2 rounded mt-1 overflow-auto break-all">{result.cspHeader || "(未設定)"}</pre>
          </div>
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}
              {result._debug.risks && <ul className="mt-1">{result._debug.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Csp() {
  const [vulnResult, setVulnResult] = useState<CspResult | null>(null);
  const [secureResult, setSecureResult] = useState<CspResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure", name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/page?name=${encodeURIComponent(name)}`);
      const data: CspResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false } as CspResult;
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout title="CSP (Content Security Policy)" subtitle="XSS対策としてのCSP設定" description="Content Security Policyヘッダーを設定することで、XSSが存在してもインラインスクリプトの実行や外部リソースの読み込みをブラウザレベルでブロックできる防御策を体験します。">
      <ComparisonPanel
        vulnerableContent={<CspPanel mode="vulnerable" result={vulnResult} isLoading={loading} onTest={(n) => handleTest("vulnerable", n)} />}
        secureContent={<CspPanel mode="secure" result={secureResult} isLoading={loading} onTest={(n) => handleTest("secure", n)} />}
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
