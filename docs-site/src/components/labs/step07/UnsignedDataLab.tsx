import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './UnsignedDataLab.module.css';

const BASE = '/api/labs/unsigned-data';

type AdminResult = {
  success: boolean;
  message: string;
  adminData?: Record<string, unknown>;
  _debug?: { message: string; currentRole?: string };
};

function UnsignedPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: 'vulnerable' | 'secure';
  result: AdminResult | null;
  isLoading: boolean;
  onTest: (role: string, sessionId?: string) => void;
}) {
  const [role, setRole] = useState('user');
  const [sessionId, setSessionId] = useState('demo-user-session');

  return (
    <div>
      {mode === 'vulnerable' ? (
        <div className={styles.mb2}>
          <label className={styles.selectLabel}>X-User-Role ヘッダー:</label>
          <select
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">user</option>
            <option value="admin">admin（改ざん）</option>
          </select>
        </div>
      ) : (
        <div className={styles.mb2}>
          <label className={styles.selectLabel}>セッションID:</label>
          <select
            className={styles.select}
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          >
            <option value="demo-user-session">一般ユーザー</option>
            <option value="demo-admin-session">管理者</option>
            <option value="invalid">無効なセッション</option>
          </select>
        </div>
      )}
      <FetchButton
        onClick={() =>
          onTest(role, mode === 'secure' ? sessionId : undefined)
        }
        disabled={isLoading}
      >
        管理者ページにアクセス
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'アクセス成功' : 'アクセス拒否'}
          className={styles.resultAlert}
        >
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?.adminData && (
            <pre className={styles.adminPre}>
              {JSON.stringify(result.adminData, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugMessage}>
              {result._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * 署名なしデータの信頼ラボUI
 *
 * HTTPヘッダーやCookieの値を署名なしでそのまま信頼する脆弱性を体験する。
 */
export function UnsignedDataLab() {
  const [vulnerable, setVulnerable] = useState<AdminResult | null>(null);
  const [secure, setSecure] = useState<AdminResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (
    mode: 'vulnerable' | 'secure',
    role: string,
    sessionId?: string,
  ) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (mode === 'vulnerable') {
        headers['X-User-Role'] = role;
      }
      if (sessionId) {
        headers['X-Session-Id'] = sessionId;
      }
      const res = await fetch(`${BASE}/${mode}/admin`, { headers });
      const data: AdminResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch (e) {
      const fallback: AdminResult = {
        success: false,
        message: (e as Error).message,
      };
      if (mode === 'vulnerable') {
        setVulnerable(fallback);
      } else {
        setSecure(fallback);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <UnsignedPanel
            mode="vulnerable"
            result={vulnerable}
            isLoading={loading}
            onTest={(role) => handleTest('vulnerable', role)}
          />
        }
        secureContent={
          <UnsignedPanel
            mode="secure"
            result={secure}
            isLoading={loading}
            onTest={(_, sid) => handleTest('secure', '', sid)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: X-User-Role を admin
            に変えるだけで管理者アクセスできるか
          </li>
          <li>安全版: サーバー側セッションで権限を検証しているか</li>
          <li>クライアントデータを信頼しない原則を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
