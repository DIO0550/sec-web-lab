import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './PrivilegeEscalationLab.module.css';

const BASE = '/api/labs/privilege-escalation';

type LoginResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  user?: { id: number; username: string; role: string };
};

type UsersResult = {
  success: boolean;
  message?: string;
  users?: Array<Record<string, unknown>>;
  _debug?: { message: string; currentUser: Record<string, unknown>; requiredRole?: string };
};

type SettingsResult = {
  success: boolean;
  message?: string;
  settings?: Record<string, unknown>;
  _debug?: { message: string; currentUser: Record<string, unknown> };
};

const loginPresets = [
  { label: 'user1 (一般)', username: 'user1', password: 'password1' },
  { label: 'admin (管理者)', username: 'admin', password: 'admin123' },
];

// --- ログインフォーム ---
function LoginForm({
  mode,
  loginResult,
  isLoading,
  onLogin,
}: {
  mode: 'vulnerable' | 'secure';
  loginResult: LoginResult | null;
  isLoading: boolean;
  onLogin: (mode: 'vulnerable' | 'secure', username: string, password: string) => void;
}) {
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('password1');

  return (
    <div className={styles.formGroup}>
      <Input
        label="ユーザー名:"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.inputGroup}
      />
      <Input
        label="パスワード:"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.inputGroup}
      />
      <FetchButton onClick={() => onLogin(mode, username, password)} disabled={isLoading}>
        ログイン
      </FetchButton>
      <PresetButtons
        presets={loginPresets}
        onSelect={(p) => {
          setUsername(p.username);
          setPassword(p.password);
        }}
        className={styles.presetRow}
      />
      <ExpandableSection isOpen={!!loginResult}>
        <Alert
          variant={loginResult?.success ? 'success' : 'error'}
          className={styles.resultAlert}
        >
          {loginResult?.message}
          {loginResult?.user && (
            <span className={styles.roleInfo}>
              (role: <strong>{loginResult.user.role}</strong>)
            </span>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- 結果表示 ---
function ResultDisplay({
  result,
  type,
}: {
  result: UsersResult | SettingsResult | null;
  type: 'users' | 'settings';
}) {
  return (
    <ExpandableSection isOpen={!!result}>
      <Alert
        variant={result?.success ? 'success' : 'error'}
        title={
          result?.success
            ? type === 'users'
              ? 'ユーザー一覧取得成功'
              : '設定変更成功'
            : 'アクセス拒否'
        }
        className={styles.resultAlert}
      >
        {result?.message && <div className={styles.smallText}>{result.message}</div>}
        {type === 'users' && result && 'users' in result && result.users && (
          <pre className={styles.codeBlock}>
            {JSON.stringify(result.users, null, 2)}
          </pre>
        )}
        {type === 'settings' && result && 'settings' in result && result.settings && (
          <pre className={styles.codeBlock}>
            {JSON.stringify(result.settings, null, 2)}
          </pre>
        )}
        {result?._debug && (
          <div className={styles.debugInfo}>
            {result._debug.message}
          </div>
        )}
      </Alert>
    </ExpandableSection>
  );
}

// --- メインコンポーネント ---
export function PrivilegeEscalationLab() {
  const [vulnSession, setVulnSession] = useState<string | null>(null);
  const [secureSession, setSecureSession] = useState<string | null>(null);

  // login state
  const [vulnLoginResult, setVulnLoginResult] = useState<LoginResult | null>(null);
  const [secureLoginResult, setSecureLoginResult] = useState<LoginResult | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // users state
  const [vulnUsersResult, setVulnUsersResult] = useState<UsersResult | null>(null);
  const [secureUsersResult, setSecureUsersResult] = useState<UsersResult | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  // settings state
  const [vulnSettingsResult, setVulnSettingsResult] = useState<SettingsResult | null>(null);
  const [secureSettingsResult, setSecureSettingsResult] = useState<SettingsResult | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const handleLogin = async (mode: 'vulnerable' | 'secure', username: string, password: string) => {
    setLoginLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: LoginResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnLoginResult(data);
      } else {
        setSecureLoginResult(data);
      }
      if (data.sessionId) {
        if (mode === 'vulnerable') {
          setVulnSession(data.sessionId);
        } else {
          setSecureSession(data.sessionId);
        }
      }
    } catch (e) {
      const errResult: LoginResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnLoginResult(errResult);
      } else {
        setSecureLoginResult(errResult);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchUsers = async (mode: 'vulnerable' | 'secure') => {
    const sessionId = mode === 'vulnerable' ? vulnSession : secureSession;
    if (!sessionId) return;

    setUsersLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/admin/users`, {
        headers: { 'X-Session-Id': sessionId },
      });
      const data: UsersResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnUsersResult(data);
      } else {
        setSecureUsersResult(data);
      }
    } catch (e) {
      const errResult: UsersResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnUsersResult(errResult);
      } else {
        setSecureUsersResult(errResult);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const changeSettings = async (mode: 'vulnerable' | 'secure') => {
    const sessionId = mode === 'vulnerable' ? vulnSession : secureSession;
    if (!sessionId) return;

    setSettingsLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({ maintenance_mode: true }),
      });
      const data: SettingsResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnSettingsResult(data);
      } else {
        setSecureSettingsResult(data);
      }
    } catch (e) {
      const errResult: SettingsResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnSettingsResult(errResult);
      } else {
        setSecureSettingsResult(errResult);
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <>
      <h3 className={styles.sectionTitle}>Step 1: 一般ユーザーでログイン</h3>
      <p className={styles.description}>
        まず <code>user1</code>（一般ユーザー、role: user）としてログインしてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm
            mode="vulnerable"
            loginResult={vulnLoginResult}
            isLoading={loginLoading}
            onLogin={handleLogin}
          />
        }
        secureContent={
          <LoginForm
            mode="secure"
            loginResult={secureLoginResult}
            isLoading={loginLoading}
            onLogin={handleLogin}
          />
        }
      />

      <h3 className={styles.sectionTitle}>Step 2: 管理者用APIにアクセス</h3>
      <p className={styles.description}>
        一般ユーザーのセッションで、管理者用のユーザー一覧APIにアクセスしてみてください。
        脆弱版では全ユーザー情報が取得でき、安全版では 403 エラーが返されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <div>
            <FetchButton
              onClick={() => fetchUsers('vulnerable')}
              disabled={usersLoading || !vulnSession}
            >
              管理者用ユーザー一覧を取得
            </FetchButton>
            {!vulnSession && <p className={styles.loginHint}>先にログインしてください</p>}
            <ResultDisplay result={vulnUsersResult} type="users" />
          </div>
        }
        secureContent={
          <div>
            <FetchButton
              onClick={() => fetchUsers('secure')}
              disabled={usersLoading || !secureSession}
            >
              管理者用ユーザー一覧を取得
            </FetchButton>
            {!secureSession && <p className={styles.loginHint}>先にログインしてください</p>}
            <ResultDisplay result={secureUsersResult} type="users" />
          </div>
        }
      />

      <h3 className={styles.sectionTitle}>Step 3: 管理者設定を変更</h3>
      <p className={styles.description}>
        さらに、管理者用のシステム設定変更API（メンテナンスモード有効化）を実行してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <div>
            <FetchButton
              onClick={() => changeSettings('vulnerable')}
              disabled={settingsLoading || !vulnSession}
            >
              メンテナンスモードを有効化
            </FetchButton>
            <ResultDisplay result={vulnSettingsResult} type="settings" />
          </div>
        }
        secureContent={
          <div>
            <FetchButton
              onClick={() => changeSettings('secure')}
              disabled={settingsLoading || !secureSession}
            >
              メンテナンスモードを有効化
            </FetchButton>
            <ResultDisplay result={secureSettingsResult} type="settings" />
          </div>
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 一般ユーザーで管理者APIにアクセスし、ユーザー一覧の取得と設定変更ができるか</li>
          <li>安全版: 同じ操作で 403 エラーが返されるか</li>
          <li>フロントエンドのUI制御（メニュー非表示）だけではセキュリティにならない理由を理解したか</li>
          <li>ミドルウェアによるロール検証のメリット（チェック漏れ防止）を説明できるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
