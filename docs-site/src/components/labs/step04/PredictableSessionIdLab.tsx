import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './PredictableSessionIdLab.module.css';

const BASE = '/api/labs/predictable-session-id';

type LoginResponse = {
  message?: string;
  sessionId?: string;
  error?: string;
};

type ProfileResponse = {
  username?: string;
  email?: string;
  error?: string;
};

function SessionPanel({
  mode,
}: {
  mode: 'vulnerable' | 'secure';
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  const [probeSessionId, setProbeSessionId] = useState('');
  const [loginResult, setLoginResult] = useState<LoginResponse | null>(null);
  const [profileResult, setProfileResult] = useState<ProfileResponse | null>(null);
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
      if (body.sessionId) {
        setSessionId(body.sessionId);
        setSessionHistory((prev) => [...prev, body.sessionId!]);
        // 脆弱版の場合、次の連番を初期値に設定
        if (mode === 'vulnerable') {
          const num = parseInt(body.sessionId, 10);
          if (!isNaN(num)) {
            setProbeSessionId(String(num - 1));
          }
        }
      }
    } catch (e) {
      setLoginResult({ error: e instanceof Error ? e.message : String(e) });
    }
    setLoading(false);
  };

  const handleGetProfile = async (sid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile`, {
        headers: { 'X-Session-Id': sid },
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
          variant={loginResult?.sessionId ? 'success' : 'error'}
          title={loginResult?.sessionId ? 'ログイン成功' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div>{loginResult?.error || loginResult?.message}</div>
          {loginResult?.sessionId && (
            <div className={styles.tokenDisplay}>
              セッションID: {loginResult.sessionId}
            </div>
          )}
        </Alert>
      </ExpandableSection>

      <ExpandableSection isOpen={sessionHistory.length > 0}>
        <div className={styles.codeBlock}>
          発行されたセッションID履歴:{'\n'}
          {sessionHistory.map((s, i) => `${i + 1}. ${s}`).join('\n')}
        </div>
      </ExpandableSection>

      {sessionId && (
        <>
          <FetchButton
            onClick={() => handleGetProfile(sessionId)}
            disabled={loading}
          >
            自分のセッションIDでプロフィール取得
          </FetchButton>

          <div className={styles.inputGroup} style={{ marginTop: '0.5rem' }}>
            <Input
              label="別のセッションIDでアクセス"
              type="text"
              value={probeSessionId}
              onChange={(e) => setProbeSessionId(e.target.value)}
            />
          </div>
          <FetchButton
            onClick={() => handleGetProfile(probeSessionId)}
            disabled={loading || !probeSessionId}
          >
            別のセッションIDでプロフィール取得
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
 * 推測可能なセッションIDラボUI
 *
 * 連番のセッションIDが予測可能で他人のセッションを乗っ取れることを体験する。
 */
export function PredictableSessionIdLab() {
  return (
    <>
      <h3>Lab: セッションID予測攻撃の検証</h3>
      <p className={styles.description}>
        ログインして発行されるセッションIDのパターンを観察してください。
        脆弱版ではセッションIDが連番で生成されるため、他人のセッションIDを推測してアクセスできます。
        安全版ではcrypto.randomUUID()による推測不可能なIDが生成されます。
      </p>

      <ComparisonPanel
        vulnerableContent={<SessionPanel mode="vulnerable" />}
        secureContent={<SessionPanel mode="secure" />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: セッションIDが連番（1001, 1002, ...）で予測可能か</li>
          <li>脆弱版: 推測したセッションIDで他人のプロフィールにアクセスできるか</li>
          <li>安全版: セッションIDがUUID形式でランダムか</li>
          <li>安全版: 推測したIDではアクセスが拒否されるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
