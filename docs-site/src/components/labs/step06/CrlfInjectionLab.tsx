import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './CrlfInjectionLab.module.css';

const BASE = '/api/labs/crlf-injection';

type CrlfResult = {
  success: boolean;
  message?: string;
  action?: string;
  locationHeader?: string;
  sanitized?: boolean;
  _debug?: { message: string; crlfDetected?: boolean; injectedHeaders?: string[] };
};

const presets = [
  { label: '通常リダイレクト', value: '/dashboard' },
  { label: 'CRLF + Cookie注入', value: '/dashboard%0d%0aSet-Cookie:%20admin=true' },
  { label: 'CRLF + XSS', value: '/dashboard%0d%0a%0d%0a<script>alert(1)</script>' },
];

function CrlfPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: 'vulnerable' | 'secure';
  result: CrlfResult | null;
  isLoading: boolean;
  onTest: (url: string) => void;
}) {
  const [url, setUrl] = useState('/dashboard');

  return (
    <div>
      <Input
        label="リダイレクト先URL:"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className={styles.inputGroup}
      />
      <PresetButtons presets={presets} onSelect={(p) => setUrl(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onTest(url)} disabled={isLoading}>
        リダイレクトテスト
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? 'success' : 'error'} title="Locationヘッダー" className={styles.resultAlert}>
          <pre className={styles.codeBlock}>{result?.locationHeader}</pre>
          {result?.sanitized !== undefined && (
            <div className={styles.smallText}>
              {result.sanitized ? '改行コードが除去されました' : 'サニタイズなし'}
            </div>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result._debug.message}
              {result._debug.injectedHeaders && result._debug.injectedHeaders.length > 0 && (
                <div className={styles.smallText}>
                  注入されたヘッダー:
                  <ul className={styles.headerList}>
                    {result._debug.injectedHeaders.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * CRLFインジェクションラボUI
 *
 * HTTPレスポンスヘッダーへの改行コード注入を体験する。
 */
export function CrlfInjectionLab() {
  const [vulnResult, setVulnResult] = useState<CrlfResult | null>(null);
  const [secureResult, setSecureResult] = useState<CrlfResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: 'vulnerable' | 'secure', url: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/redirect?url=${encodeURIComponent(url)}`);
      const data: CrlfResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: CrlfResult = {
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
      <h3>Lab: CRLFインジェクション</h3>
      <p className={styles.description}>
        脆弱版ではCRLFペイロードでSet-Cookieヘッダーが注入されます。
        安全版では改行コードが除去されて安全にリダイレクトされます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <CrlfPanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onTest={(url) => handleTest('vulnerable', url)}
          />
        }
        secureContent={
          <CrlfPanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onTest={(url) => handleTest('secure', url)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: CRLFペイロードでSet-Cookieヘッダーが注入されるか</li>
          <li>安全版: 改行コードが除去されて安全にリダイレクトされるか</li>
          <li>HTTPレスポンススプリッティングの危険性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
