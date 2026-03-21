import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './IdorLab.module.css';

const BASE = '/api/labs/idor';

type LoginResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  user?: { id: number; username: string };
};

type ProfileResult = {
  success: boolean;
  message?: string;
  profile?: Record<string, unknown>;
  _debug?: { message: string; currentUserId: number; requestedId: number };
};

const loginPresets = [
  { label: 'user1 / password1', username: 'user1', password: 'password1' },
  { label: 'user2 / password2', username: 'user2', password: 'password2' },
  { label: 'admin / admin123', username: 'admin', password: 'admin123' },
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
            <span className={styles.userId}>(ID: {loginResult.user.id})</span>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- プロフィール取得フォーム ---
function ProfileForm({
  sessionId,
  result,
  isLoading,
  onFetch,
}: {
  sessionId: string | null;
  result: ProfileResult | null;
  isLoading: boolean;
  onFetch: (targetId: string) => void;
}) {
  const [targetId, setTargetId] = useState('1');

  return (
    <div className={styles.formGroup}>
      <Input
        label="取得するユーザーID:"
        type="number"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        min="1"
        className={styles.inputGroup}
      />
      <div className={styles.idButtons}>
        {['1', '2', '3'].map((id) => (
          <Button key={id} variant="ghost" size="sm" onClick={() => setTargetId(id)}>
            ID={id}
          </Button>
        ))}
      </div>
      <FetchButton onClick={() => onFetch(targetId)} disabled={isLoading || !sessionId}>
        プロフィール取得
      </FetchButton>
      {!sessionId && <p className={styles.loginHint}>先にログインしてください</p>}

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'データ取得成功' : 'アクセス拒否'}
          className={styles.resultAlert}
        >
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?.profile && (
            <pre className={styles.codeBlock}>
              {JSON.stringify(result.profile, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result._debug.message}
              <br />
              ログインユーザーID: {result._debug.currentUserId} / リクエストID: {result._debug.requestedId}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function IdorLab() {
  const [vulnSession, setVulnSession] = useState<string | null>(null);
  const [secureSession, setSecureSession] = useState<string | null>(null);

  // login state
  const [vulnLoginResult, setVulnLoginResult] = useState<LoginResult | null>(null);
  const [secureLoginResult, setSecureLoginResult] = useState<LoginResult | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // profile state
  const [vulnProfileResult, setVulnProfileResult] = useState<ProfileResult | null>(null);
  const [secureProfileResult, setSecureProfileResult] = useState<ProfileResult | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  const fetchProfile = async (mode: 'vulnerable' | 'secure', targetId: string) => {
    const sessionId = mode === 'vulnerable' ? vulnSession : secureSession;
    if (!sessionId) return;

    setProfileLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/users/${targetId}/profile`, {
        headers: { 'X-Session-Id': sessionId },
      });
      const data: ProfileResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnProfileResult(data);
      } else {
        setSecureProfileResult(data);
      }
    } catch (e) {
      const errResult: ProfileResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnProfileResult(errResult);
      } else {
        setSecureProfileResult(errResult);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      <h3 className={styles.sectionTitle}>Step 1: ログイン</h3>
      <p className={styles.description}>
        まず user1 (ID=2) としてログインしてください。その後、IDを書き換えて他ユーザーのプロフィールにアクセスしてみましょう。
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

      <h3 className={styles.sectionTitle}>Step 2: 他ユーザーのプロフィールにアクセス</h3>
      <p className={styles.description}>
        ログインしたユーザーとは異なるIDを指定して、プロフィールを取得してみてください。
        脆弱版では他ユーザーのデータが取得でき、安全版ではアクセスが拒否されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <ProfileForm
            sessionId={vulnSession}
            result={vulnProfileResult}
            isLoading={profileLoading}
            onFetch={(id) => fetchProfile('vulnerable', id)}
          />
        }
        secureContent={
          <ProfileForm
            sessionId={secureSession}
            result={secureProfileResult}
            isLoading={profileLoading}
            onFetch={(id) => fetchProfile('secure', id)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: user1 でログインした状態で、ID=1（admin）のプロフィールを取得できるか</li>
          <li>安全版: 同じ操作を行うと 403 エラーで拒否されるか</li>
          <li>認証（誰がログインしたか）と認可（何にアクセスしてよいか）の違いを理解したか</li>
          <li>安全な実装がセッションIDとリクエストIDの照合でどう機能するか説明できるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
