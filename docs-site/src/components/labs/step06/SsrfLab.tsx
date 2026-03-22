import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './SsrfLab.module.css';

const BASE = '/api/labs/ssrf';

type FetchResult = {
  success: boolean;
  message?: string;
  status?: number;
  contentType?: string;
  body?: string;
  _debug?: { message: string; requestedUrl?: string; blockedHost?: string };
};

const presets = [
  { label: '外部サイト', value: 'https://httpbin.org/get' },
  { label: 'localhost', value: 'http://localhost:3000/api/health' },
  { label: 'メタデータAPI', value: 'http://169.254.169.254/latest/meta-data/' },
  { label: '内部IP', value: 'http://10.0.0.1/admin' },
];

function FetchPanel({
  mode,
  result,
  isLoading,
  onFetch,
}: {
  mode: 'vulnerable' | 'secure';
  result: FetchResult | null;
  isLoading: boolean;
  onFetch: (url: string) => void;
}) {
  const [url, setUrl] = useState('https://httpbin.org/get');

  return (
    <div>
      <Input
        label="取得先URL:"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className={styles.inputGroup}
      />
      <PresetButtons presets={presets} onSelect={(p) => setUrl(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onFetch(url)} disabled={isLoading}>
        Fetch実行
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? `レスポンス取得 (${result?.status})` : 'リクエストブロック'}
          className={styles.resultAlert}
        >
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?.body && (
            <pre className={styles.codeBlock}>
              {result.body.substring(0, 500)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>{result._debug.message}</div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * SSRFラボUI
 *
 * サーバーを踏み台にした内部ネットワークへの不正アクセスを体験する。
 */
export function SsrfLab() {
  const [vulnResult, setVulnResult] = useState<FetchResult | null>(null);
  const [secureResult, setSecureResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async (mode: 'vulnerable' | 'secure', url: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data: FetchResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: FetchResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnResult(errorResult);
      } else {
        setSecureResult(errorResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: SSRF (Server-Side Request Forgery)</h3>
      <p className={styles.description}>
        脆弱版ではlocalhostや169.254.169.254へのリクエストが成功します。
        安全版ではプライベートIPへのリクエストがブロックされます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <FetchPanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onFetch={(url) => handleFetch('vulnerable', url)}
          />
        }
        secureContent={
          <FetchPanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onFetch={(url) => handleFetch('secure', url)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: localhost や 169.254.169.254 へのリクエストが成功するか</li>
          <li>安全版: プライベートIPへのリクエストがブロックされるか</li>
          <li>SSRFがクラウド環境でメタデータAPI経由の認証情報窃取につながることを理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
