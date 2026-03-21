import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './RateLimitingLab.module.css';

const BASE = '/api/labs/rate-limiting';

type LoginResult = {
  success: boolean;
  message: string;
  locked?: boolean;
  attemptsRemaining?: number;
  attemptsUsed?: number;
  _debug?: { message: string; totalAttempts?: number };
};

const BRUTE_FORCE_PASSWORDS = [
  '123456',
  'password',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  'master',
  'qwerty',
  'abc123',
  'secretpass',
];

function LoginPanel({
  mode,
  results,
  isLoading,
  onLogin,
  onBruteForce,
}: {
  mode: 'vulnerable' | 'secure';
  results: LoginResult[];
  isLoading: boolean;
  onLogin: (username: string, password: string) => void;
  onBruteForce: () => void;
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('wrongpass');

  return (
    <div>
      <Input
        label="ユーザー名:"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.mb2}
      />
      <Input
        label="パスワード:"
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.mb2}
      />
      <div className={styles.buttonRow}>
        <FetchButton
          onClick={() => onLogin(username, password)}
          disabled={isLoading}
        >
          ログイン試行
        </FetchButton>
        <FetchButton onClick={onBruteForce} disabled={isLoading}>
          連続10回試行
        </FetchButton>
      </div>

      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.resultScroll}>
          {results.map((r, i) => (
            <Alert
              key={i}
              variant={r.success ? 'success' : r.locked ? 'warning' : 'error'}
              className={styles.resultAlert}
            >
              #{i + 1}: {r.message}
              {r.attemptsRemaining !== undefined &&
                ` (残り${r.attemptsRemaining}回)`}
              {r._debug && (
                <span className={styles.attemptsInfo}>
                  {' '}
                  [{r._debug.totalAttempts}回目]
                </span>
              )}
            </Alert>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * レート制限なしラボUI
 *
 * ブルートフォース攻撃が無制限に可能な脆弱性を体験する。
 */
export function RateLimitingLab() {
  const [vulnResults, setVulnResults] = useState<LoginResult[]>([]);
  const [secureResults, setSecureResults] = useState<LoginResult[]>([]);
  const [loading, setLoading] = useState(false);

  const appendResult = (
    mode: 'vulnerable' | 'secure',
    data: LoginResult,
  ) => {
    if (mode === 'vulnerable') {
      setVulnResults((prev) => [...prev, data]);
    } else {
      setSecureResults((prev) => [...prev, data]);
    }
  };

  const handleLogin = async (
    mode: 'vulnerable' | 'secure',
    username: string,
    password: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: LoginResult = await res.json();
      appendResult(mode, data);
    } catch (e) {
      appendResult(mode, { success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const handleBruteForce = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    for (const pw of BRUTE_FORCE_PASSWORDS) {
      try {
        const res = await fetch(`${BASE}/${mode}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: pw }),
        });
        const data: LoginResult = await res.json();
        appendResult(mode, data);
        if (data.success || data.locked) {
          break;
        }
      } catch {
        break;
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <LoginPanel
            mode="vulnerable"
            results={vulnResults}
            isLoading={loading}
            onLogin={(u, p) => handleLogin('vulnerable', u, p)}
            onBruteForce={() => handleBruteForce('vulnerable')}
          />
        }
        secureContent={
          <LoginPanel
            mode="secure"
            results={secureResults}
            isLoading={loading}
            onLogin={(u, p) => handleLogin('secure', u, p)}
            onBruteForce={() => handleBruteForce('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 10回連続で試行できるか（最後にパスワードが当たる）</li>
          <li>安全版: 5回目以降でアカウントロックされるか</li>
          <li>レート制限とアカウントロックの違いを理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
