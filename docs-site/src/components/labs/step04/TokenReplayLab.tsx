import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './TokenReplayLab.module.css';

const BASE = '/api/labs/token-replay';

type LoginResponse = {
  message?: string;
  token?: string;
  error?: string;
};

type LogoutResponse = {
  message?: string;
  error?: string;
};

type ProfileResponse = {
  username?: string;
  email?: string;
  error?: string;
};

function ReplayPanel({
  mode,
}: {
  mode: 'vulnerable' | 'secure';
}) {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('password123');
  const [token, setToken] = useState<string | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [loginResult, setLoginResult] = useState<LoginResponse | null>(null);
  const [logoutResult, setLogoutResult] = useState<LogoutResponse | null>(null);
  const [profileResult, setProfileResult] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setLoggedOut(false);
    setLogoutResult(null);
    setProfileResult(null);
    try {
      const { body } = await postJson<LoginResponse>(`${BASE}/${mode}/login`, {
        username,
        password,
      });
      setLoginResult(body);
      if (body.token) {
        setToken(body.token);
      }
    } catch (e) {
      setLoginResult({ error: e instanceof Error ? e.message : String(e) });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (!token) return;
    setLoading(true);
    setProfileResult(null);
    try {
      const res = await fetch(`${BASE}/${mode}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as LogoutResponse;
      setLogoutResult(body);
      setLoggedOut(true);
    } catch (e) {
      setLogoutResult({ error: e instanceof Error ? e.message : String(e) });
    }
    setLoading(false);
  };

  const handleProfileAfterLogout = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as ProfileResponse;
      setProfileResult(body);
    } catch (e) {
      setProfileResult({ error: e instanceof Error ? e.message : String(e) });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className={styles.inputGroup}>
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className={styles.inputGroup}>
        <Input
          label="パスワード"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <FetchButton onClick={handleLogin} disabled={loading}>
        ログイン
      </FetchButton>

      <ExpandableSection isOpen={!!loginResult}>
        <Alert
          variant={loginResult?.token ? 'success' : 'error'}
          title={loginResult?.token ? 'ログイン成功' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div>{loginResult?.error || loginResult?.message}</div>
          {loginResult?.token && (
            <div className={styles.tokenDisplay}>
              トークン: {loginResult.token}
            </div>
          )}
        </Alert>
      </ExpandableSection>

      {token && !loggedOut && (
        <FetchButton onClick={handleLogout} disabled={loading}>
          ログアウト
        </FetchButton>
      )}

      <ExpandableSection isOpen={!!logoutResult}>
        <Alert
          variant="info"
          title="ログアウト完了"
          className={styles.resultAlert}
        >
          <div>{logoutResult?.message || logoutResult?.error}</div>
        </Alert>
      </ExpandableSection>

      {token && loggedOut && (
        <FetchButton onClick={handleProfileAfterLogout} disabled={loading}>
          ログアウト後にプロフィール取得
        </FetchButton>
      )}

      <ExpandableSection isOpen={!!profileResult}>
        <Alert
          variant={profileResult?.username ? 'success' : 'error'}
          title={
            profileResult?.username
              ? 'アクセス成功（トークン再利用可能）'
              : 'アクセス拒否'
          }
          className={styles.resultAlert}
        >
          {profileResult?.error && <div>{profileResult.error}</div>}
          {profileResult?.username && (
            <div className={styles.codeBlock}>
              {JSON.stringify(profileResult, null, 2)}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * トークンリプレイラボUI
 *
 * ログアウト後もトークンが有効で再利用できる脆弱性を体験する。
 */
export function TokenReplayLab() {
  return (
    <>
      <h3>Lab: トークン再利用攻撃の検証</h3>
      <p className={styles.description}>
        ログインしてトークンを取得し、ログアウト後に同じトークンでアクセスを試みてください。
        脆弱版ではログアウト後もトークンが有効でプロフィールにアクセスできます。
        安全版ではトークンがブラックリストに登録され、ログアウト後のアクセスが拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={<ReplayPanel mode="vulnerable" />}
        secureContent={<ReplayPanel mode="secure" />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: ログアウト後もトークンでプロフィールにアクセスできるか</li>
          <li>安全版: ログアウト後にトークンが無効化されるか</li>
          <li>安全版: 「トークンは無効化されています」というエラーが返るか</li>
          <li>クライアント側のトークン削除だけでは不十分な理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
