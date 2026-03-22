import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './SsrfBypassLab.module.css';

const BASE = '/api/labs/ssrf-bypass';

type FetchResult = {
  success: boolean;
  message?: string;
  status?: number;
  contentType?: string;
  body?: string;
  _debug?: { message: string; requestedUrl?: string; blockedKeyword?: string; resolvedIP?: string; originalHostname?: string };
};

const presets = [
  { label: 'localhost (ブロック)', value: 'http://localhost:3000/api/labs/ssrf-bypass/vulnerable/internal' },
  { label: '0x7f000001 (16進)', value: 'http://0x7f000001:3000/api/labs/ssrf-bypass/vulnerable/internal' },
  { label: '0177.0.0.1 (8進)', value: 'http://0177.0.0.1:3000/api/labs/ssrf-bypass/vulnerable/internal' },
  { label: '[::1] (IPv6)', value: 'http://[::1]:3000/api/labs/ssrf-bypass/vulnerable/internal' },
  { label: '2130706433 (10進整数)', value: 'http://2130706433:3000/api/labs/ssrf-bypass/vulnerable/internal' },
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
  const [url, setUrl] = useState('http://localhost:3000/api/labs/ssrf-bypass/vulnerable/internal');

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
          {result?.message && <div>{result.message}</div>}
          {result?.body && (
            <pre className={styles.codeBlock}>
              {result.body.substring(0, 500)}
            </pre>
          )}
          {result?._debug && (
            <div style={{ fontSize: '0.75rem', color: 'var(--lab-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              {result._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * SSRF BypassラボUI
 *
 * ブロックリストの文字列一致チェックをIPアドレス代替表現で回避する攻撃を体験する。
 */
export function SsrfBypassLab() {
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
      <h3>Lab: SSRF Bypass</h3>
      <p className={styles.description}>
        脆弱版では "localhost" や "127.0.0.1" のみを文字列一致でブロックしています。
        16進数(0x7f000001)、8進数(0177.0.0.1)、IPv6([::1])、10進整数(2130706433) などの代替表現で回避を試みてください。
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
          <li>脆弱版: localhostはブロックされるが、代替表現(0x7f000001等)で内部APIにアクセスできるか</li>
          <li>安全版: DNS解決後のIPアドレス検証により全ての代替表現がブロックされるか</li>
          <li>文字列マッチングによるブロックリストが根本的に不十分である理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
