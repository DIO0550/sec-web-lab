import { useLabFetch, fetchJsonWithHeaders } from '@site/src/hooks/useLabFetch';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { HeaderViewer } from '@site/src/components/lab-ui/ResponseViewer';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { EndpointUrl } from '@site/src/components/lab-ui/EndpointUrl';
import { Alert } from '@site/src/components/lab-ui/Alert';

/**
 * HTTP Header Information Leakage ラボ UI
 *
 * パターンA: useLabFetch + fetchJsonWithHeaders
 */
export function HeaderLeakageLab() {
  const { vulnerable, secure, loading, isLoading, error, fetchVulnerable, fetchSecure } =
    useLabFetch('/api/labs/header-leakage', fetchJsonWithHeaders);

  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}

      <ComparisonPanel
        vulnerableContent={
          <>
            <EndpointUrl
              method="GET"
              action={
                <FetchButton
                  onClick={() => fetchVulnerable()}
                  disabled={isLoading}
                  isLoading={loading?.startsWith('vulnerable')}
                  loadingText="送信中..."
                >
                  リクエスト送信
                </FetchButton>
              }
            >
              /api/labs/header-leakage/vulnerable/
            </EndpointUrl>
            <HeaderViewer result={vulnerable} mode="vulnerable" />
          </>
        }
        secureContent={
          <>
            <EndpointUrl
              method="GET"
              action={
                <FetchButton
                  onClick={() => fetchSecure()}
                  disabled={isLoading}
                  isLoading={loading?.startsWith('secure')}
                  loadingText="送信中..."
                >
                  リクエスト送信
                </FetchButton>
              }
            >
              /api/labs/header-leakage/secure/
            </EndpointUrl>
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
    </>
  );
}
