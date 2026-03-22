import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './HostHeaderInjectionLab.module.css';

const BASE = '/api/labs/host-header-injection';

type ResetResult = {
  success: boolean;
  message?: string;
  resetLink?: string;
  token?: string;
  _debug?: { message: string; usedHost?: string; usedBaseUrl?: string; rejectedHost?: string; allowedHosts?: string[] };
};

const presets = [
  { label: '正常 (localhost:5173)', value: 'localhost:5173' },
  { label: '攻撃 (evil.example.com)', value: 'evil.example.com' },
  { label: '攻撃 (phishing.attacker.net)', value: 'phishing.attacker.net' },
];

function ResetPanel({
  mode,
  result,
  isLoading,
  onReset,
}: {
  mode: 'vulnerable' | 'secure';
  result: ResetResult | null;
  isLoading: boolean;
  onReset: (email: string, customHost: string) => void;
}) {
  const [email, setEmail] = useState('victim@example.com');
  const [customHost, setCustomHost] = useState('');

  return (
    <div>
      <Input
        label="メールアドレス:"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.inputGroup}
      />
      <Input
        label="X-Custom-Host ヘッダ値:"
        value={customHost}
        onChange={(e) => setCustomHost(e.target.value)}
        placeholder="空欄の場合はデフォルトのHostを使用"
        className={styles.inputGroup}
      />
      <PresetButtons
        presets={presets}
        onSelect={(p) => setCustomHost(p.value)}
        className={styles.presets}
      />
      <FetchButton onClick={() => onReset(email, customHost)} disabled={isLoading}>
        リセット要求
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'リセットリンク生成' : 'エラー'}
          className={styles.resultAlert}
        >
          {result?.message && <div>{result.message}</div>}
          {result?.resetLink && (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '0.5rem' }}>生成されたリセットリンク:</div>
              <pre className={styles.codeBlock}>{result.resetLink}</pre>
            </div>
          )}
          {result?._debug && (
            <div style={{ fontSize: '0.75rem', color: 'var(--lab-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              {result._debug.message}
              {result._debug.rejectedHost && ` (拒否: ${result._debug.rejectedHost})`}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * Host Header InjectionラボUI
 *
 * Hostヘッダを信頼してリセットリンクを生成する脆弱性を体験する。
 */
export function HostHeaderInjectionLab() {
  const [vulnResult, setVulnResult] = useState<ResetResult | null>(null);
  const [secureResult, setSecureResult] = useState<ResetResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (mode: 'vulnerable' | 'secure', email: string, customHost: string) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customHost.trim()) {
        headers['X-Custom-Host'] = customHost.trim();
      }
      const res = await fetch(`${BASE}/${mode}/reset-request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });
      const data: ResetResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: ResetResult = {
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
      <h3>Lab: Host Header Injection</h3>
      <p className={styles.description}>
        脆弱版ではX-Custom-Hostヘッダの値がリセットリンクのドメインに反映されます。
        攻撃者のドメインを指定して、リセットリンクが偽装されることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <ResetPanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onReset={(email, host) => handleReset('vulnerable', email, host)}
          />
        }
        secureContent={
          <ResetPanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onReset={(email, host) => handleReset('secure', email, host)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: X-Custom-Hostに "evil.example.com" を指定するとリセットリンクのドメインが偽装されるか</li>
          <li>安全版: 許可リストにないHostヘッダが拒否されるか、またはリンクがハードコードされたベースURLを使用するか</li>
          <li>Hostヘッダを信頼してはいけない理由と、環境変数によるベースURL固定の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
