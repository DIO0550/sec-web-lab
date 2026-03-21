import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './SessionFixationLab.module.css';

const BASE = '/api/labs/session-fixation';

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
  warning?: string;
  info?: string;
  username?: string;
  userId?: number;
};

// --- 脆弱バージョンのデモ ---
function VulnerableDemo() {
  const [step, setStep] = useState(0);
  const [fixedSessionId, setFixedSessionId] = useState('attacker-fixed-session');
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: ApiResult) => {
    setResults((prev) => [...prev, result]);
  };

  // Step 1: 攻撃者がセッションIDを仕込む
  const handleSetSession = async () => {
    setLoading(true);
    setResults([]);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/vulnerable/set-session`,
        { sessionId: fixedSessionId },
      );
      addResult({ ...data, message: `[攻撃者] ${data.message}` });
      setStep(1);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  // Step 2: 被害者がそのセッションIDでログイン
  const handleVictimLogin = async () => {
    setLoading(true);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/vulnerable/login`,
        { username: 'alice', password: 'alice123' },
      );
      addResult({ ...data, message: `[被害者] ${data.message}` });
      setStep(2);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  // Step 3: 攻撃者が同じセッションIDでプロフィール取得
  const handleAttackerAccess = async () => {
    setLoading(true);
    try {
      const data = await getWithCredentials<ApiResult>(`${BASE}/vulnerable/profile`);
      addResult({
        ...data,
        message: `[攻撃者] ${data.success ? `${data.username} のプロフィールにアクセス成功!` : data.message}`,
      });
      setStep(3);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const handleReset = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: 'POST' });
      await fetch(`${BASE}/vulnerable/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setStep(0);
    setResults([]);
  };

  return (
    <div>
      <Input
        label="攻撃者が仕込むセッションID"
        type="text"
        value={fixedSessionId}
        onChange={(e) => setFixedSessionId(e.target.value)}
        className={styles.sessionInput}
      />

      <div className={styles.stepButtons}>
        <FetchButton onClick={handleSetSession} disabled={loading || step >= 1}>
          Step 1: 攻撃者がセッションIDを仕込む
        </FetchButton>
        <FetchButton onClick={handleVictimLogin} disabled={loading || step < 1 || step >= 2}>
          Step 2: 被害者がログイン (alice)
        </FetchButton>
        <FetchButton onClick={handleAttackerAccess} disabled={loading || step < 2 || step >= 3}>
          Step 3: 攻撃者がアクセス
        </FetchButton>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          リセット
        </Button>
      </div>

      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.resultList}>
          {results.map((r, i) => (
            <Alert
              key={i}
              variant={r.success ? 'success' : 'error'}
              className={styles.resultItem}
            >
              <div className={styles.resultBold}>{r.message}</div>
              {r.sessionId && (
                <div className={styles.sessionId}>SessionID: {r.sessionId}</div>
              )}
              {r.warning && <div className={styles.warningText}>{r.warning}</div>}
              {r.username && r.success && i === results.length - 1 && (
                <div className={styles.hijackSuccess}>
                  セッション乗っ取り成功! {r.username} としてアクセスできました
                </div>
              )}
            </Alert>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- 安全バージョンのデモ ---
function SecureDemo() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: ApiResult) => {
    setResults((prev) => [...prev, result]);
  };

  // Step 1: 被害者が安全版でログイン
  const handleLogin = async () => {
    setLoading(true);
    setResults([]);
    try {
      const data = await postWithCredentials<ApiResult>(
        `${BASE}/secure/login`,
        { username: 'alice', password: 'alice123' },
      );
      addResult({ ...data, message: `[被害者] ${data.message}` });
      setStep(1);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  // Step 2: プロフィールが取得できることを確認
  const handleProfile = async () => {
    setLoading(true);
    try {
      const data = await getWithCredentials<ApiResult>(`${BASE}/secure/profile`);
      addResult({
        ...data,
        message: data.success
          ? `[確認] ${data.username} のプロフィールを取得`
          : `[確認] ${data.message}`,
      });
      setStep(2);
    } catch (e) {
      addResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const handleReset = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: 'POST' });
      await fetch(`${BASE}/secure/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setStep(0);
    setResults([]);
  };

  return (
    <div>
      <div className={styles.stepButtons}>
        <FetchButton onClick={handleLogin} disabled={loading || step >= 1}>
          Step 1: ログイン (alice) — 新しいセッションIDが生成
        </FetchButton>
        <FetchButton onClick={handleProfile} disabled={loading || step < 1 || step >= 2}>
          Step 2: プロフィールを確認
        </FetchButton>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          リセット
        </Button>
      </div>

      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.resultList}>
          {results.map((r, i) => (
            <Alert
              key={i}
              variant={r.success ? 'success' : 'error'}
              className={styles.resultItem}
            >
              <div className={styles.resultBold}>{r.message}</div>
              {r.info && <div className={styles.infoText}>{r.info}</div>}
            </Alert>
          ))}
        </div>
      </ExpandableSection>

      <Alert variant="info" className={styles.pointAlert}>
        <strong>ポイント:</strong> ログイン時に新しいセッションIDが生成され、古いIDは無効化されます。
        攻撃者が事前に仕込んだセッションIDは、ログイン後に使えなくなります。
      </Alert>
    </div>
  );
}

/**
 * セッション固定攻撃ラボUI
 *
 * 攻撃者が仕込んだセッションIDで被害者をログインさせ、セッションを乗っ取る攻撃を体験する。
 */
export function SessionFixationLab() {
  return (
    <>
      <h3>Lab: セッション固定攻撃のシミュレーション</h3>
      <p className={styles.description}>
        脆弱版では攻撃者が仕込んだセッションIDがそのまま使われ、ログイン後に攻撃者がアクセスできます。
        安全版ではログイン時に新しいセッションIDが生成されるため、攻撃が失敗します。
      </p>

      <ComparisonPanel
        vulnerableContent={<VulnerableDemo />}
        secureContent={<SecureDemo />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 攻撃者が仕込んだセッションIDでログイン後もアクセスできるか</li>
          <li>安全版: ログイン時にセッションIDが変更されるか</li>
          <li>セッション固定攻撃が成立するための条件を説明できるか</li>
          <li>セッションIDの再生成がなぜこの攻撃を防げるのか理解したか</li>
          <li>セッション固定とセッションハイジャックの違いを説明できるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
