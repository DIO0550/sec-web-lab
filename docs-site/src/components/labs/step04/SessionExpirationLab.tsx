import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './SessionExpirationLab.module.css';

const BASE = '/api/labs/session-expiration';

type LoginResponse = {
  message?: string;
  token?: string;
  expiresInSeconds?: number;
  error?: string;
};

type ProfileResponse = {
  username?: string;
  email?: string;
  createdAt?: number;
  remainingSeconds?: number;
  message?: string;
  error?: string;
};

function ExpirationPanel({
  mode,
}: {
  mode: 'vulnerable' | 'secure';
}) {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('password123');
  const [token, setToken] = useState<string | null>(null);
  const [loginResult, setLoginResult] = useState<LoginResponse | null>(null);
  const [profileResult, setProfileResult] = useState<ProfileResponse | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
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

  const handleGetProfile = async () => {
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

  const handleWaitAndAccess = async () => {
    if (!token) return;
    setWaiting(true);
    setProfileResult(null);
    // 12秒待ってからアクセス（安全版の有効期限10秒を超える）
    await new Promise((resolve) => setTimeout(resolve, 12000));
    setWaiting(false);
    await handleGetProfile();
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
      <FetchButton onClick={handleLogin} disabled={loading || waiting}>
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
          {loginResult?.expiresInSeconds != null && (
            <div className={styles.responseTime}>
              有効期限: {loginResult.expiresInSeconds}秒
            </div>
          )}
        </Alert>
      </ExpandableSection>

      {token && (
        <>
          <FetchButton onClick={handleGetProfile} disabled={loading || waiting}>
            プロフィール取得
          </FetchButton>
          <FetchButton onClick={handleWaitAndAccess} disabled={loading || waiting}>
            {waiting ? '待機中（12秒）...' : '12秒待機して再アクセス'}
          </FetchButton>
        </>
      )}

      <ExpandableSection isOpen={!!profileResult}>
        <Alert
          variant={profileResult?.username ? 'success' : 'error'}
          title={profileResult?.username ? 'プロフィール取得成功' : 'アクセス拒否'}
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
 * セッション有効期限ラボUI
 *
 * 有効期限が設定されていないトークンは永久に有効であることを体験する。
 */
export function SessionExpirationLab() {
  return (
    <>
      <h3>Lab: セッション有効期限の検証</h3>
      <p className={styles.description}>
        ログイン後、時間経過後のアクセスを試してください。
        脆弱版ではトークンに有効期限がなく、何時間経っても有効です。
        安全版ではトークンの有効期限が10秒に設定されており、期限切れ後はアクセスが拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={<ExpirationPanel mode="vulnerable" />}
        secureContent={<ExpirationPanel mode="secure" />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 12秒待機後もプロフィールにアクセスできるか</li>
          <li>安全版: 12秒待機後にアクセスが拒否されるか</li>
          <li>安全版: 「セッションの有効期限が切れました」というエラーが返るか</li>
          <li>有効期限がない場合のリスク（放置端末、漏洩トークン）を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
