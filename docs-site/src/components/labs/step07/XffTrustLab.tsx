import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './XffTrustLab.module.css';

const BASE = '/api/labs/xff-trust';

type LoginResult = {
  success: boolean;
  message?: string;
  locked?: boolean;
  clientIp?: string;
  attemptsUsed?: number;
  attemptsRemaining?: number;
  _debug?: { message: string; detectedIp?: string; ignoredXff?: string | null };
};

type WhoamiResult = {
  clientIp: string;
  xff: string | null;
  _debug?: { message: string };
};

const xffPresets = [
  { label: '10.1.0.1', value: '10.1.0.1' },
  { label: '10.2.0.1', value: '10.2.0.1' },
  { label: '192.168.1.100', value: '192.168.1.100' },
  { label: '未設定', value: '' },
];

function LoginPanel({
  mode,
  results,
  whoami,
  isLoading,
  onLogin,
  onWhoami,
}: {
  mode: 'vulnerable' | 'secure';
  results: LoginResult[];
  whoami: WhoamiResult | null;
  isLoading: boolean;
  onLogin: (username: string, password: string, xff: string) => void;
  onWhoami: (xff: string) => void;
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('wrongpass');
  const [xff, setXff] = useState('');

  return (
    <div>
      <Input
        label="ユーザー名:"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.inputGroup}
      />
      <Input
        label="パスワード:"
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.inputGroup}
      />
      <Input
        label="X-Forwarded-For:"
        type="text"
        value={xff}
        onChange={(e) => setXff(e.target.value)}
        placeholder="空欄の場合はヘッダなし"
        className={styles.inputGroup}
      />
      <PresetButtons
        presets={xffPresets}
        onSelect={(p) => setXff(p.value)}
        className={styles.presets}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <FetchButton onClick={() => onLogin(username, password, xff)} disabled={isLoading}>
          ログイン試行
        </FetchButton>
        <FetchButton onClick={() => onWhoami(xff)} disabled={isLoading}>
          whoami
        </FetchButton>
      </div>

      {whoami && (
        <Alert variant="info" className={styles.resultAlert}>
          検出IP: <strong>{whoami.clientIp}</strong>
          {whoami.xff && ` (XFF: ${whoami.xff})`}
        </Alert>
      )}

      <ExpandableSection isOpen={results.length > 0}>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {results.map((r, i) => (
            <Alert
              key={i}
              variant={r.success ? 'success' : r.locked ? 'warning' : 'error'}
              className={styles.resultAlert}
            >
              #{i + 1}: {r.message}
              {r.clientIp && ` [IP: ${r.clientIp}]`}
              {r.attemptsUsed !== undefined && ` (試行: ${r.attemptsUsed}回)`}
              {r.attemptsRemaining !== undefined && ` (残り: ${r.attemptsRemaining}回)`}
            </Alert>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * X-Forwarded-For TrustラボUI
 *
 * X-Forwarded-Forヘッダの値を変えることでIPベースのレート制限を回避する攻撃を体験する。
 */
export function XffTrustLab() {
  const [vulnResults, setVulnResults] = useState<LoginResult[]>([]);
  const [secureResults, setSecureResults] = useState<LoginResult[]>([]);
  const [vulnWhoami, setVulnWhoami] = useState<WhoamiResult | null>(null);
  const [secureWhoami, setSecureWhoami] = useState<WhoamiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: 'vulnerable' | 'secure', username: string, password: string, xff: string) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (xff.trim()) {
        headers['X-Forwarded-For'] = xff.trim();
      }
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, password }),
      });
      const data: LoginResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, data]);
      } else {
        setSecureResults((prev) => [...prev, data]);
      }
    } catch (e) {
      const errorResult: LoginResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, errorResult]);
      } else {
        setSecureResults((prev) => [...prev, errorResult]);
      }
    }
    setLoading(false);
  };

  const handleWhoami = async (mode: 'vulnerable' | 'secure', xff: string) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (xff.trim()) {
        headers['X-Forwarded-For'] = xff.trim();
      }
      const res = await fetch(`${BASE}/${mode}/whoami`, { headers });
      const data: WhoamiResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnWhoami(data);
      } else {
        setSecureWhoami(data);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: X-Forwarded-For Trust</h3>
      <p className={styles.description}>
        脆弱版ではX-Forwarded-Forの先頭値をクライアントIPとして使用します。
        値を変えるたびにレート制限(5回/分)のカウントがリセットされることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <LoginPanel
            mode="vulnerable"
            results={vulnResults}
            whoami={vulnWhoami}
            isLoading={loading}
            onLogin={(u, p, xff) => handleLogin('vulnerable', u, p, xff)}
            onWhoami={(xff) => handleWhoami('vulnerable', xff)}
          />
        }
        secureContent={
          <LoginPanel
            mode="secure"
            results={secureResults}
            whoami={secureWhoami}
            isLoading={loading}
            onLogin={(u, p, xff) => handleLogin('secure', u, p, xff)}
            onWhoami={(xff) => handleWhoami('secure', xff)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: X-Forwarded-Forの値を変えて6回以上ログイン試行できるか</li>
          <li>安全版: X-Forwarded-Forを変えてもレート制限が回避できないか</li>
          <li>X-Forwarded-Forヘッダを無条件に信頼してはいけない理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
