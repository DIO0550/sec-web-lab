import { useState, useCallback } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './BruteForceLab.module.css';

const BASE = '/api/labs/brute-force';

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  locked?: boolean;
  remainingSeconds?: number;
  attemptsUsed?: number;
  maxAttempts?: number;
};

type BruteForceLog = {
  password: string;
  result: LoginResult;
};

// --- パスワード辞書（デモ用） ---
const PASSWORD_DICTIONARY = [
  'password', '123456', 'admin', 'admin123', 'letmein',
  'welcome', 'monkey', 'dragon', 'master', 'qwerty',
];

// --- 単発ログインフォーム ---
function LoginForm({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: 'vulnerable' | 'secure';
  result: LoginResult | null;
  isLoading: boolean;
  onSubmit: (mode: 'vulnerable' | 'secure', username: string, password: string) => void;
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  return (
    <div>
      <div className={styles.formFields}>
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="パスワード"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : result?.locked ? 'warning' : 'error'}
          title={result?.success ? 'ログイン成功' : result?.locked ? 'アカウントロック' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?.attemptsUsed !== undefined && (
            <div className={styles.attemptsInfo}>
              試行回数: {result?.attemptsUsed} / {result?.maxAttempts}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- 辞書攻撃シミュレーション ---
function DictionaryAttack({
  mode,
  logs,
  isRunning,
  onStart,
  onReset,
}: {
  mode: 'vulnerable' | 'secure';
  logs: BruteForceLog[];
  isRunning: boolean;
  onStart: (mode: 'vulnerable' | 'secure') => void;
  onReset?: () => void;
}) {
  return (
    <div>
      <div className={styles.buttonRow}>
        <FetchButton onClick={() => onStart(mode)} disabled={isRunning}>
          辞書攻撃を開始
        </FetchButton>
        {mode === 'secure' && onReset && (
          <Button variant="secondary" size="sm" onClick={onReset}>
            リセット
          </Button>
        )}
      </div>

      <div className={styles.dictionaryNote}>
        辞書: [{PASSWORD_DICTIONARY.join(', ')}]
      </div>

      <ExpandableSection isOpen={logs.length > 0}>
        <div className={styles.tableWrapper}>
          <table className={styles.resultTable}>
            <thead>
              <tr>
                <th className={styles.resultTh}>#</th>
                <th className={styles.resultTh}>パスワード</th>
                <th className={styles.resultTh}>結果</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={i}
                  className={log.result.success ? styles.successRow : log.result.locked ? styles.warningRow : undefined}
                >
                  <td className={styles.resultTd}>{i + 1}</td>
                  <td className={`${styles.resultTd} ${styles.mono}`}>{log.password}</td>
                  <td className={styles.resultTd}>
                    {log.result.success ? (
                      <span className={styles.successText}>突破成功!</span>
                    ) : log.result.locked ? (
                      <span className={styles.warningText}>ブロック (429)</span>
                    ) : (
                      <span className={styles.mutedText}>失敗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * ブルートフォース攻撃ラボUI
 *
 * パスワード辞書を使った総当たり攻撃と、レート制限による防御を体験する。
 */
export function BruteForceLab() {
  const [vulnResult, setVulnResult] = useState<LoginResult | null>(null);
  const [secureResult, setSecureResult] = useState<LoginResult | null>(null);
  const [vulnLogs, setVulnLogs] = useState<BruteForceLog[]>([]);
  const [secureLogs, setSecureLogs] = useState<BruteForceLog[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: 'vulnerable' | 'secure', username: string, password: string) => {
    setLoading(true);
    try {
      const { body } = await postJson<LoginResult>(`${BASE}/${mode}/login`, { username, password });
      if (mode === 'vulnerable') {
        setVulnResult(body);
      } else {
        setSecureResult(body);
      }
    } catch (e) {
      const errorResult: LoginResult = { success: false, message: e instanceof Error ? e.message : String(e) };
      if (mode === 'vulnerable') {
        setVulnResult(errorResult);
      } else {
        setSecureResult(errorResult);
      }
    }
    setLoading(false);
  };

  const runDictionaryAttack = useCallback(async (mode: 'vulnerable' | 'secure') => {
    setRunning(true);
    const logs: BruteForceLog[] = [];
    if (mode === 'vulnerable') {
      setVulnLogs([]);
    } else {
      setSecureLogs([]);
    }

    for (const password of PASSWORD_DICTIONARY) {
      try {
        const { body } = await postJson<LoginResult>(`${BASE}/${mode}/login`, {
          username: 'admin',
          password,
        });
        const log = { password, result: body };
        logs.push(log);

        if (mode === 'vulnerable') {
          setVulnLogs([...logs]);
        } else {
          setSecureLogs([...logs]);
        }

        // 成功またはロックされたら停止
        if (body.success || body.locked) {
          break;
        }
      } catch (e) {
        logs.push({
          password,
          result: { success: false, message: e instanceof Error ? e.message : String(e) },
        });
      }
    }
    setRunning(false);
  }, []);

  const resetSecure = useCallback(async () => {
    try {
      await fetch(`${BASE}/secure/reset`, { method: 'POST' });
      setSecureLogs([]);
      setSecureResult(null);
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <h3>Lab 1: 手動ログイン試行</h3>
      <p className={styles.description}>
        間違ったパスワードを何度か入力してみてください。
        脆弱版は何度でも試行できますが、安全版は5回で制限されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={vulnResult} isLoading={loading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={secureResult} isLoading={loading} onSubmit={handleLogin} />
        }
      />

      <h3 className={styles.lab2Heading}>Lab 2: 辞書攻撃シミュレーション</h3>
      <p className={styles.description}>
        パスワード辞書を使った自動攻撃をシミュレーションします。
        脆弱版では <code>admin123</code> が見つかるまで全候補を試行でき、
        安全版ではレート制限によりブロックされます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <DictionaryAttack mode="vulnerable" logs={vulnLogs} isRunning={running} onStart={runDictionaryAttack} />
        }
        secureContent={
          <DictionaryAttack mode="secure" logs={secureLogs} isRunning={running} onStart={runDictionaryAttack} onReset={resetSecure} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 何度でもログイン試行できるか</li>
          <li>安全版: 5回失敗後にHTTP 429でブロックされるか</li>
          <li>辞書攻撃で脆弱版の <code>admin123</code> が数回の試行で突破されるか</li>
          <li>安全版のレート制限が辞書攻撃を途中でブロックするか</li>
          <li>レート制限だけでは不十分な場合（IPを変えた攻撃等）を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
