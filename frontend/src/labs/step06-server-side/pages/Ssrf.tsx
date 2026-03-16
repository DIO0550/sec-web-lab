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

const BASE = "/api/labs/ssrf";

type FetchResult = {
  success: boolean;
  message?: string;
  status?: number;
  contentType?: string;
  body?: string;
  _debug?: { message: string; requestedUrl?: string; blockedHost?: string };
};

const presets = [
  { label: "外部サイト", value: "https://httpbin.org/get" },
  { label: "localhost", value: "http://localhost:3000/api/health" },
  { label: "メタデータAPI", value: "http://169.254.169.254/latest/meta-data/" },
  { label: "内部IP", value: "http://10.0.0.1/admin" },
];

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

  return (
    <div>
      <Input label="取得先URL:" value={url} onChange={(e) => setUrl(e.target.value)} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setUrl(p.value)} className="mb-2" />
      <FetchButton onClick={() => onFetch(url)} disabled={isLoading}>
        Fetch実行
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? `レスポンス取得 (${result?.status})` : "リクエストブロック"} className="mt-2">
          {result?.message && <div className="text-sm mt-1">{result?.message}</div>}
          {result?.body && (
            <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto max-h-[200px]">
              {result?.body.substring(0, 500)}
            </pre>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">{result?._debug.message}</div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function Ssrf() {
  const result = useComparisonFetch<FetchResult>(BASE);

  const handleFetch = async (mode: "vulnerable" | "secure", url: string) => {
    await result.postJson(mode, "/fetch", { url }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="SSRF (Server-Side Request Forgery)"
      subtitle="サーバーを踏み台にした内部ネットワークへの不正アクセス"
      description="ユーザーが指定したURLをサーバーが代理でリクエストする機能を悪用して、内部ネットワークやクラウドメタデータAPIにアクセスする攻撃を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <FetchPanel mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onFetch={(url) => handleFetch("vulnerable", url)} />
        }
        secureContent={
          <FetchPanel mode="secure" result={result.secure} isLoading={result.loading} onFetch={(url) => handleFetch("secure", url)} />
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
