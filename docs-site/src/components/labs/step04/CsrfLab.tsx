import { useState, useCallback } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './CsrfLab.module.css';

const BASE = '/api/labs/csrf';

// credentials: 'include' 付きの POST ヘルパー
async function postWithCredentials<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

// credentials: 'include' 付きの GET ヘルパー
async function getWithCredentials<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  return res.json() as Promise<T>;
}

type ApiResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  csrfToken?: string;
};

// --- 脆弱バージョン ---
function VulnerableDemo() {
  const [loginResult, setLoginResult] = useState<ApiResult | null>(null);
  const [profileResult, setProfileResult] = useState<ApiResult | null>(null);
  const [changeResult, setChangeResult] = useState<ApiResult | null>(null);
  const [newPassword, setNewPassword] = useState('hacked123');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/vulnerable/login`,
        { username: 'alice', password: 'alice123' },
      );
      setLoginResult(data);
      setProfileResult(null);
      setChangeResult(null);
    } catch (e) {
      setLoginResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  const handleProfile = useCallback(async () => {
    try {
      const data = await getWithCredentials<ApiResult>(`${BASE}/vulnerable/profile`);
      setProfileResult(data);
    } catch {
      // ignore
    }
  }, []);

  // CSRF攻撃をシミュレート
  const handleCsrfAttack = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/vulnerable/change-password`,
        { newPassword },
      );
      setChangeResult(data);
      handleProfile();
    } catch (e) {
      setChangeResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, [newPassword, handleProfile]);

  return (
    <div>
      <FetchButton onClick={handleLogin} disabled={loading}>
        alice でログイン
      </FetchButton>

      <ExpandableSection isOpen={!!loginResult}>
        <Alert
          variant={loginResult?.success ? 'success' : 'error'}
          className={styles.resultAlert}
        >
          <div className={styles.smallText}>{loginResult?.message}</div>
        </Alert>
      </ExpandableSection>

      <ExpandableSection isOpen={!!loginResult?.success}>
        <>
          <div className={styles.profileSection}>
            <FetchButton onClick={handleProfile} disabled={loading}>
              プロフィール確認
            </FetchButton>
            <ExpandableSection isOpen={!!profileResult}>
              <div className={styles.profileBox}>
                <div>ユーザー: {profileResult?.username}</div>
                <div>メール: {profileResult?.email}</div>
                <div>現在のパスワード: <code>{profileResult?.currentPassword}</code></div>
              </div>
            </ExpandableSection>
          </div>

          <Alert variant="warning" className={styles.attackSection}>
            <div className={styles.attackTitle}>
              CSRF攻撃シミュレーション（罠ページからのリクエスト）
            </div>
            <Input
              label="攻撃者が変更するパスワード"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.attackInput}
            />
            <FetchButton onClick={handleCsrfAttack} disabled={loading}>
              CSRF攻撃を実行（CSRFトークンなし）
            </FetchButton>

            <ExpandableSection isOpen={!!changeResult}>
              <Alert
                variant={changeResult?.success ? 'error' : 'success'}
                title={changeResult?.success ? '攻撃成功!' : '攻撃失敗'}
                className={styles.changeResultAlert}
              >
                <div className={styles.smallText}>{changeResult?.message}</div>
              </Alert>
            </ExpandableSection>
          </Alert>
        </>
      </ExpandableSection>
    </div>
  );
}

// --- 安全バージョン ---
function SecureDemo() {
  const [loginResult, setLoginResult] = useState<ApiResult | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [changeResult, setChangeResult] = useState<ApiResult | null>(null);
  const [attackResult, setAttackResult] = useState<ApiResult | null>(null);
  const [newPassword, setNewPassword] = useState('newpassword123');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/secure/login`,
        { username: 'alice', password: 'alice123' },
      );
      setLoginResult(data);
      setChangeResult(null);
      setAttackResult(null);
      setCsrfToken('');
    } catch (e) {
      setLoginResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  const handleGetToken = useCallback(async () => {
    try {
      const data = await getWithCredentials<ApiResult>(`${BASE}/secure/csrf-token`);
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    } catch {
      // ignore
    }
  }, []);

  // 正規のパスワード変更（CSRFトークン付き）
  const handleLegitChange = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/secure/change-password`,
        { newPassword, csrfToken },
      );
      setChangeResult(data);
    } catch (e) {
      setChangeResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, [newPassword, csrfToken]);

  // CSRF攻撃を試みる（トークンなし）
  const handleCsrfAttack = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/secure/change-password`,
        { newPassword: 'hacked123' },
      );
      setAttackResult(data);
    } catch (e) {
      setAttackResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  return (
    <div>
      <FetchButton onClick={handleLogin} disabled={loading}>
        alice でログイン
      </FetchButton>

      <ExpandableSection isOpen={!!loginResult}>
        <Alert
          variant={loginResult?.success ? 'success' : 'error'}
          className={styles.resultAlert}
        >
          <div className={styles.smallText}>{loginResult?.message}</div>
        </Alert>
      </ExpandableSection>

      <ExpandableSection isOpen={!!loginResult?.success}>
        <>
          {/* 正規のパスワード変更フロー */}
          <Alert variant="success" className={styles.legitSection}>
            <div className={styles.attackTitle}>
              正規のパスワード変更（CSRFトークン付き）
            </div>
            <div className={styles.tokenRow}>
              <FetchButton onClick={handleGetToken} disabled={loading}>
                CSRFトークンを取得
              </FetchButton>
            </div>
            <ExpandableSection isOpen={!!csrfToken}>
              <div className={styles.tokenDisplay}>
                Token: {csrfToken}
              </div>
            </ExpandableSection>
            <Input
              label="新しいパスワード"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.attackInput}
            />
            <FetchButton
              onClick={handleLegitChange}
              disabled={loading || !csrfToken}
            >
              パスワード変更（トークン付き）
            </FetchButton>
            <ExpandableSection isOpen={!!changeResult}>
              <Alert
                variant={changeResult?.success ? 'success' : 'error'}
                className={styles.changeResultAlert}
              >
                <div className={styles.smallText}>{changeResult?.message}</div>
              </Alert>
            </ExpandableSection>
          </Alert>

          {/* CSRF攻撃の試行 */}
          <Alert variant="warning" className={styles.attackSection}>
            <div className={styles.attackTitle}>
              CSRF攻撃シミュレーション（トークンなし）
            </div>
            <FetchButton onClick={handleCsrfAttack} disabled={loading}>
              CSRF攻撃を実行（トークンなしで送信）
            </FetchButton>
            <ExpandableSection isOpen={!!attackResult}>
              <Alert
                variant={attackResult?.success ? 'error' : 'success'}
                title={attackResult?.success ? '攻撃成功（問題あり）' : '攻撃失敗（防御成功）'}
                className={styles.changeResultAlert}
              >
                <div className={styles.smallText}>{attackResult?.message}</div>
              </Alert>
            </ExpandableSection>
          </Alert>
        </>
      </ExpandableSection>
    </div>
  );
}

/**
 * CSRFラボUI
 *
 * CSRF攻撃によるパスワード変更とCSRFトークンによる防御を体験する。
 */
export function CsrfLab() {
  const handleReset = useCallback(async () => {
    try {
      await fetch(`${BASE}/reset`, { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.reload();
  }, []);

  return (
    <>
      <div className={styles.resetRow}>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          全データリセット
        </Button>
      </div>

      <h3>Lab: CSRF攻撃によるパスワード変更</h3>
      <p className={styles.description}>
        脆弱版ではCSRFトークンなしでパスワード変更が成功します（外部サイトからのリクエストでも成功する）。
        安全版ではCSRFトークンが必要で、トークンなしのリクエストは拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={<VulnerableDemo />}
        secureContent={<SecureDemo />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: CSRFトークンなしでパスワード変更が成功するか</li>
          <li>安全版: CSRFトークンなしだと403エラーで拒否されるか</li>
          <li>安全版: CSRFトークン付きなら正常に変更できるか</li>
          <li>CSRF攻撃が成立するための3つの条件を説明できるか</li>
          <li>CSRFトークンが攻撃を無効化する仕組みを理解したか</li>
          <li><code>SameSite=Strict</code> がCSRF防御に有効な理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
