import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/crlf-injection";

type CrlfResult = {
  success: boolean;
  message?: string;
  action?: string;
  locationHeader?: string;
  sanitized?: boolean;
  _debug?: { message: string; crlfDetected?: boolean; injectedHeaders?: string[] };
};

function CrlfPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  result: CrlfResult | null;
  isLoading: boolean;
  onTest: (url: string) => void;
}) {
  const [url, setUrl] = useState("/dashboard");

  const presets = [
    { label: "通常リダイレクト", value: "/dashboard" },
    { label: "CRLF + Cookie注入", value: "/dashboard%0d%0aSet-Cookie:%20admin=true" },
    { label: "CRLF + XSS", value: "/dashboard%0d%0a%0d%0a<script>alert(1)</script>" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">リダイレクト先URL:</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-sm"
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setUrl(p.value)} className="text-[11px] py-0.5 px-2 cursor-pointer">
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onTest(url)} disabled={isLoading}>
        リダイレクトテスト
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className="font-bold text-sm">Locationヘッダー</div>
          <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-1 overflow-auto">{result.locationHeader}</pre>
          {result.sanitized !== undefined && (
            <div className="text-xs mt-1">
              {result.sanitized ? "改行コードが除去されました" : "サニタイズなし"}
            </div>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              {result._debug.message}
              {result._debug.injectedHeaders && result._debug.injectedHeaders.length > 0 && (
                <div className="mt-1">
                  注入されたヘッダー:
                  <ul>{result._debug.injectedHeaders.map((h, i) => <li key={i} className="font-mono">{h}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CrlfInjection() {
  const [vulnResult, setVulnResult] = useState<CrlfResult | null>(null);
  const [secureResult, setSecureResult] = useState<CrlfResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure", url: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/redirect?url=${encodeURIComponent(url)}`);
      const data: CrlfResult = await res.json();
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
      title="CRLFインジェクション"
      subtitle="HTTPレスポンスヘッダーへの改行コード注入"
      description="ユーザー入力がHTTPレスポンスヘッダーに含まれる場合、改行コード（CRLF: \r\n）を注入して任意のヘッダーやレスポンスボディを追加できる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <CrlfPanel mode="vulnerable" result={vulnResult} isLoading={loading} onTest={(url) => handleTest("vulnerable", url)} />
        }
        secureContent={
          <CrlfPanel mode="secure" result={secureResult} isLoading={loading} onTest={(url) => handleTest("secure", url)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: CRLFペイロードでSet-Cookieヘッダーが注入されるか</li>
          <li>安全版: 改行コードが除去されて安全にリダイレクトされるか</li>
          <li>HTTPレスポンススプリッティングの危険性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
