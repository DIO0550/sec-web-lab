import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './PlaintextPasswordLab.module.css';

const BASE = '/api/labs/plaintext-password';

type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
};

type UsersResult = {
  users: User[];
  _debug?: { message: string };
  error?: string;
};

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
};

const loginPresets = [
  { label: 'admin / admin123', username: 'admin', password: 'admin123' },
  { label: 'user1 / password1', username: 'user1', password: 'password1' },
];

// --- ユーザー一覧パネル ---
function UsersPanel({
  mode,
  result,
  isLoading,
  onFetch,
}: {
  mode: 'vulnerable' | 'secure';
  result: UsersResult | null;
  isLoading: boolean;
  onFetch: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onFetch} disabled={isLoading}>
        ユーザー一覧を取得
      </FetchButton>

      {result?.error && (
        <pre className={styles.errorText}>{result.error}</pre>
      )}

      <ExpandableSection isOpen={!!result?.users}>
        <div className={styles.tableWrapper}>
          <table className={styles.resultTable}>
            <thead>
              <tr>
                <th className={styles.resultTh}>username</th>
                <th className={styles.resultTh}>password</th>
                <th className={styles.resultTh}>email</th>
                <th className={styles.resultTh}>role</th>
              </tr>
            </thead>
            <tbody>
              {result?.users.map((u) => (
                <tr key={u.id}>
                  <td className={styles.resultTd}>{u.username}</td>
                  <td className={`${styles.resultTd} ${styles.mono} ${mode === 'vulnerable' ? styles.vulnCell : styles.secureCell}`}>
                    {u.password}
                  </td>
                  <td className={styles.resultTd}>{u.email}</td>
                  <td className={styles.resultTd}>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result?._debug.message}
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- ログインフォーム ---
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
  const [username, setUsername] = useState('');
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

      <PresetButtons
        presets={loginPresets}
        onSelect={(p) => { setUsername(p.username); setPassword(p.password); }}
        className={styles.presets}
      />

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'ログイン成功' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?.user && (
            <pre className={styles.userJson}>
              {JSON.stringify(result?.user, null, 2)}
            </pre>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * 平文パスワード保存ラボUI
 *
 * パスワードをハッシュ化せず平文でDBに保存する危険性を体験する。
 */
export function PlaintextPasswordLab() {
  const [vulnUsers, setVulnUsers] = useState<UsersResult | null>(null);
  const [secureUsers, setSecureUsers] = useState<UsersResult | null>(null);
  const [vulnLogin, setVulnLogin] = useState<LoginResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<LoginResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/users`);
      const data: UsersResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnUsers(data);
      } else {
        setSecureUsers(data);
      }
    } catch (e) {
      const errorResult: UsersResult = { users: [], error: e instanceof Error ? e.message : String(e) };
      if (mode === 'vulnerable') {
        setVulnUsers(errorResult);
      } else {
        setSecureUsers(errorResult);
      }
    }
    setLoading(false);
  };

  const handleLogin = async (mode: 'vulnerable' | 'secure', username: string, password: string) => {
    setLoading(true);
    try {
      const { body } = await postJson<LoginResult>(`${BASE}/${mode}/login`, { username, password });
      if (mode === 'vulnerable') {
        setVulnLogin(body);
      } else {
        setSecureLogin(body);
      }
    } catch (e) {
      const errorResult: LoginResult = { success: false, message: e instanceof Error ? e.message : String(e) };
      if (mode === 'vulnerable') {
        setVulnLogin(errorResult);
      } else {
        setSecureLogin(errorResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab 1: DB内のパスワード確認</h3>
      <p className={styles.description}>
        ユーザー一覧を取得して、パスワードの保存形式を比較してください。
        脆弱版では平文、安全版ではbcryptハッシュが表示されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <UsersPanel mode="vulnerable" result={vulnUsers} isLoading={loading} onFetch={() => fetchUsers('vulnerable')} />
        }
        secureContent={
          <UsersPanel mode="secure" result={secureUsers} isLoading={loading} onFetch={() => fetchUsers('secure')} />
        }
      />

      <h3 className={styles.lab2Heading}>Lab 2: パスワードでログイン</h3>
      <p className={styles.description}>
        上で確認したパスワードを使ってログインしてみてください。
        平文保存の場合、漏洩したパスワードでそのままログインできます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={vulnLogin} isLoading={loading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={secureLogin} isLoading={loading} onSubmit={handleLogin} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: ユーザー一覧にパスワードが平文で表示されるか</li>
          <li>安全版: パスワードが <code>$2a$12$...</code> のようなbcryptハッシュで表示されるか</li>
          <li>同じパスワード（admin123）でも、安全版ではユーザーごとに異なるハッシュ値になっているか</li>
          <li>bcryptの不可逆性（ハッシュから元のパスワードを復元できない）を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
