import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/ssrf";

type FetchResult = {
  success: boolean;
  message?: string;
  status?: number;
  contentType?: string;
  body?: string;
  _debug?: { message: string; requestedUrl?: string; blockedHost?: string };
};

function FetchPanel({
  mode,
  result,
  isLoading,
  onFetch,
}: {
  mode: "vulnerable" | "secure";
  result: FetchResult | null;
  isLoading: boolean;
  onFetch: (url: string) => void;
}) {
  const [url, setUrl] = useState("https://httpbin.org/get");

  const presets = [
    { label: "外部サイト", value: "https://httpbin.org/get" },
    { label: "localhost", value: "http://localhost:3000/api/health" },
    { label: "メタデータAPI", value: "http://169.254.169.254/latest/meta-data/" },
    { label: "内部IP", value: "http://10.0.0.1/admin" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">取得先URL:</label>
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
      <FetchButton onClick={() => onFetch(url)} disabled={isLoading}>
        Fetch実行
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? `レスポンス取得 (${result.status})` : "リクエストブロック"}
          </div>
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result.body && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto max-h-[200px]">
              {result.body.substring(0, 500)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function Ssrf() {
  const [vulnResult, setVulnResult] = useState<FetchResult | null>(null);
  const [secureResult, setSecureResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async (mode: "vulnerable" | "secure", url: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: FetchResult = await res.json();
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
      title="SSRF (Server-Side Request Forgery)"
      subtitle="サーバーを踏み台にした内部ネットワークへの不正アクセス"
      description="ユーザーが指定したURLをサーバーが代理でリクエストする機能を悪用して、内部ネットワークやクラウドメタデータAPIにアクセスする攻撃を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <FetchPanel mode="vulnerable" result={vulnResult} isLoading={loading} onFetch={(url) => handleFetch("vulnerable", url)} />
        }
        secureContent={
          <FetchPanel mode="secure" result={secureResult} isLoading={loading} onFetch={(url) => handleFetch("secure", url)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: localhost や 169.254.169.254 へのリクエストが成功するか</li>
          <li>安全版: プライベートIPへのリクエストがブロックされるか</li>
          <li>SSRFがクラウド環境でメタデータAPI経由の認証情報窃取につながることを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
