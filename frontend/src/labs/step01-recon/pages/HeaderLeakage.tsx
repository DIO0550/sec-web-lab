import { useLabFetch, fetchJsonWithHeaders } from "../../../hooks/useLabFetch";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { HeaderViewer } from "../../../components/ResponseViewer";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

export function HeaderLeakage() {
  const { vulnerable, secure, loading, isLoading, fetchVulnerable, fetchSecure } =
    useLabFetch("/api/labs/header-leakage", fetchJsonWithHeaders);

  return (
    <LabLayout
      title="HTTP Header Information Leakage"
      subtitle="HTTPレスポンスヘッダーからの情報漏洩"
      description="X-Powered-By, Server 等のヘッダーから技術スタックが特定される脆弱性です。"
    >
      <ComparisonPanel
        vulnerableContent={
          <>
            <p><code>GET /api/labs/header-leakage/vulnerable/</code></p>
            <FetchButton
              onClick={() => fetchVulnerable()}
              disabled={isLoading}
              isLoading={loading?.startsWith("vulnerable")}
              loadingText="送信中..."
            >
              リクエスト送信
            </FetchButton>
            <HeaderViewer result={vulnerable} mode="vulnerable" />
          </>
        }
        secureContent={
          <>
            <p><code>GET /api/labs/header-leakage/secure/</code></p>
            <FetchButton
              onClick={() => fetchSecure()}
              disabled={isLoading}
              isLoading={loading?.startsWith("secure")}
              loadingText="送信中..."
            >
              リクエスト送信
            </FetchButton>
            <HeaderViewer result={secure} mode="secure" />
          </>
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>X-Powered-By</code>, <code>Server</code>, <code>X-Runtime</code> 等のヘッダーが見えるか</li>
          <li>安全版: これらのヘッダーが削除され、代わりに <code>X-Content-Type-Options</code> が付与されているか</li>
          <li>ターミナルで <code>curl -I http://localhost:3000/api/labs/header-leakage/vulnerable/</code> も試してみよう</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
