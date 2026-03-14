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

const BASE = "/api/labs/crlf-injection";

type CrlfResult = {
  success: boolean;
  message?: string;
  action?: string;
  locationHeader?: string;
  sanitized?: boolean;
  _debug?: { message: string; crlfDetected?: boolean; injectedHeaders?: string[] };
};

const presets = [
  { label: "通常リダイレクト", value: "/dashboard" },
  { label: "CRLF + Cookie注入", value: "/dashboard%0d%0aSet-Cookie:%20admin=true" },
  { label: "CRLF + XSS", value: "/dashboard%0d%0a%0d%0a<script>alert(1)</script>" },
];

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

  return (
    <div>
      <Input label="リダイレクト先URL:" value={url} onChange={(e) => setUrl(e.target.value)} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setUrl(p.value)} className="mb-2" />
      <FetchButton onClick={() => onTest(url)} disabled={isLoading}>
        リダイレクトテスト
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title="Locationヘッダー" className="mt-2">
          <pre className="text-xs bg-code-bg p-2 rounded mt-1 overflow-auto">{result?.locationHeader}</pre>
          {result?.sanitized !== undefined && (
            <div className="text-xs mt-1">
              {result?.sanitized ? "改行コードが除去されました" : "サニタイズなし"}
            </div>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">
              {result?._debug.message}
              {result?._debug.injectedHeaders && result?._debug.injectedHeaders.length > 0 && (
                <div className="mt-1">
                  注入されたヘッダー:
                  <ul>{result?._debug.injectedHeaders.map((h, i) => <li key={i} className="font-mono">{h}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function CrlfInjection() {
  const result = useComparisonFetch<CrlfResult>(BASE);

  const handleTest = async (mode: "vulnerable" | "secure", url: string) => {
    await result.run(mode, `/redirect?url=${encodeURIComponent(url)}`, undefined, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="CRLFインジェクション"
      subtitle="HTTPレスポンスヘッダーへの改行コード注入"
      description="ユーザー入力がHTTPレスポンスヘッダーに含まれる場合、改行コード（CRLF: \r\n）を注入して任意のヘッダーやレスポンスボディを追加できる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <CrlfPanel mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onTest={(url) => handleTest("vulnerable", url)} />
        }
        secureContent={
          <CrlfPanel mode="secure" result={result.secure} isLoading={result.loading} onTest={(url) => handleTest("secure", url)} />
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
