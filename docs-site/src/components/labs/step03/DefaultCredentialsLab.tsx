import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './DefaultCredentialsLab.module.css';

const BASE = '/api/labs/default-credentials';

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  requirePasswordChange?: boolean;
  _debug?: { message: string };
};

type ChangePasswordResult = {
  success: boolean;
  message: string;
};

type DefaultCred = {
  username: string;
  password: string;
  source: string;
};

type DefaultsResult = {
  message: string;
  credentials: DefaultCred[];
};

const loginPresets = [
  { label: 'admin / admin123', username: 'admin', password: 'admin123' },
  { label: 'admin / admin', username: 'admin', password: 'admin' },
  { label: 'admin / password', username: 'admin', password: 'password' },
];

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
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

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
          variant={result?.success ? 'success' : result?.requirePasswordChange ? 'warning' : 'error'}
          title={result?.success ? 'ログイン成功' : result?.requirePasswordChange ? 'パスワード変更が必要' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?.user && (
            <pre className={styles.userJson}>
              {JSON.stringify(result?.user, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result?._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- パスワード変更フォーム ---
function ChangePasswordForm({
  changeResult,
  isLoading,
  onChangePassword,
}: {
  changeResult: ChangePasswordResult | null;
  isLoading: boolean;
  onChangePassword: (username: string, currentPassword: string, newPassword: string) => void;
}) {
  const [username, setUsername] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('admin123');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className={styles.changePasswordBox}>
      <h4 className={styles.changePasswordTitle}>パスワード変更</h4>
      <Input
        label="ユーザー名"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        label="現在のパスワード"
        type="text"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Input
        label="新しいパスワード"
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <FetchButton
        onClick={() => onChangePassword(username, currentPassword, newPassword)}
        disabled={isLoading}
      >
        パスワード変更
      </FetchButton>

      <ExpandableSection isOpen={!!changeResult}>
        <Alert
          variant={changeResult?.success ? 'success' : 'error'}
          className={styles.changePasswordAlert}
        >
          {changeResult?.message}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * デフォルト認証情報ラボUI
 *
 * デフォルトパスワードが変更されないまま運用されるシステムへの侵入を体験する。
 */
export function DefaultCredentialsLab() {
  const [vulnResult, setVulnResult] = useState<LoginResult | null>(null);
  const [secureResult, setSecureResult] = useState<LoginResult | null>(null);
  const [changeResult, setChangeResult] = useState<ChangePasswordResult | null>(null);
  const [defaults, setDefaults] = useState<DefaultsResult | null>(null);
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

  const handleChangePassword = async (username: string, currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const { body } = await postJson<ChangePasswordResult>(`${BASE}/secure/change-password`, {
        username,
        currentPassword,
        newPassword,
      });
      setChangeResult(body);
    } catch (e) {
      setChangeResult({ success: false, message: e instanceof Error ? e.message : String(e) });
    }
    setLoading(false);
  };

  const fetchDefaults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/defaults`);
      const data: DefaultsResult = await res.json();
      setDefaults(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const resetSecure = async () => {
    try {
      await fetch(`${BASE}/secure/reset`, { method: 'POST' });
      setSecureResult(null);
      setChangeResult(null);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <h3>Lab 1: デフォルト認証情報の確認</h3>
      <p className={styles.description}>
        まず、攻撃者が入手可能なデフォルト認証情報のリストを確認してください。
      </p>
      <div className={styles.tableWrapper}>
        <FetchButton onClick={fetchDefaults} disabled={loading}>
          デフォルト認証情報を表示
        </FetchButton>
        <ExpandableSection isOpen={!!defaults}>
          <table className={styles.resultTable}>
            <thead>
              <tr>
                <th className={styles.resultTh}>username</th>
                <th className={styles.resultTh}>password</th>
                <th className={styles.resultTh}>情報源</th>
              </tr>
            </thead>
            <tbody>
              {defaults?.credentials.map((cred, i) => (
                <tr key={i}>
                  <td className={styles.resultTd}>{cred.username}</td>
                  <td className={`${styles.resultTd} ${styles.mono}`}>{cred.password}</td>
                  <td className={styles.resultTd}>{cred.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ExpandableSection>
      </div>

      <h3 className={styles.lab2Heading}>Lab 2: デフォルトパスワードでログイン</h3>
      <p className={styles.description}>
        デフォルトパスワード <code>admin123</code> でログインを試みてください。
        脆弱版ではそのままログインでき、安全版ではパスワード変更を求められます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={vulnResult} isLoading={loading} onSubmit={handleLogin} />
        }
        secureContent={
          <div>
            <LoginForm mode="secure" result={secureResult} isLoading={loading} onSubmit={handleLogin} />
            {secureResult?.requirePasswordChange && (
              <ChangePasswordForm
                changeResult={changeResult}
                isLoading={loading}
                onChangePassword={handleChangePassword}
              />
            )}
            <div className={styles.resetButton}>
              <Button variant="secondary" size="sm" onClick={resetSecure}>
                デモ状態をリセット
              </Button>
            </div>
          </div>
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>admin / admin123</code> でそのまま管理者としてログインできるか</li>
          <li>安全版: 同じ認証情報でログインが拒否され、パスワード変更を求められるか</li>
          <li>パスワード変更後に新しいパスワードでログインできるか</li>
          <li>デフォルト認証情報が危険な理由（公開情報から入手可能）を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
