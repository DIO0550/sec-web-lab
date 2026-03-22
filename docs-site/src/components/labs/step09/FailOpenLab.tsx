import { useState, useEffect } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './FailOpenLab.module.css';

const BASE = '/api/labs/fail-open';

type AdminResult = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  _debug?: { message: string };
};

function FailPanel({
  mode,
  result,
  authDown,
  isLoading,
  onAccess,
  onToggle,
}: {
  mode: 'vulnerable' | 'secure';
  result: AdminResult | null;
  authDown: boolean;
  isLoading: boolean;
  onAccess: () => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <div className={authDown ? styles.statusDown : styles.statusUp}>
        認証サービス: {authDown ? '停止中' : '稼働中'}
      </div>
      <div className={styles.buttonRow}>
        <FetchButton onClick={onToggle} disabled={isLoading}>
          認証サービス ON/OFF
        </FetchButton>
        <FetchButton onClick={onAccess} disabled={isLoading}>
          管理者ページにアクセス
        </FetchButton>
      </div>

      <ExpandableSection isOpen={!!result}>
        <div
          className={
            result?.success ? styles.resultSuccess : styles.resultFailure
          }
        >
          <div
            className={
              result?.success
                ? styles.resultTitleSuccess
                : styles.resultTitleFailure
            }
          >
            {result?.success ? 'アクセス成功' : 'アクセス拒否'}
          </div>
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?.data && (
            <pre className={styles.dataBlock}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugText}>{result._debug.message}</div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * Fail-Open ラボUI
 *
 * 認証サービス障害時のFail-Open vs Fail-Closedの違いを体験する。
 */
export function FailOpenLab() {
  const [vulnerable, setVulnerable] = useState<AdminResult | null>(null);
  const [secure, setSecure] = useState<AdminResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [authDown, setAuthDown] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/auth-service-status`)
      .then((res) => res.json())
      .then((d: { authServiceDown: boolean }) => setAuthDown(d.authServiceDown))
      .catch(() => {
        // ignore
      });
  }, []);

  const handleToggle = async () => {
    try {
      const res = await fetch(`${BASE}/toggle-auth-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data: { authServiceDown: boolean } = await res.json();
      setAuthDown(data.authServiceDown);
    } catch {
      // ignore
    }
  };

  const handleAccess = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/admin`, {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      const data: AdminResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch (e) {
      const errResult: AdminResult = {
        success: false,
        message: (e as Error).message,
      };
      if (mode === 'vulnerable') {
        setVulnerable(errResult);
      } else {
        setSecure(errResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: Fail-Open vs Fail-Closed</h3>
      <p className={styles.description}>
        認証サービスを停止した状態で管理者ページにアクセスし、
        脆弱版（Fail-Open）と安全版（Fail-Closed）の違いを体験します。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <FailPanel
            mode="vulnerable"
            result={vulnerable}
            authDown={authDown}
            isLoading={loading}
            onAccess={() => handleAccess('vulnerable')}
            onToggle={handleToggle}
          />
        }
        secureContent={
          <FailPanel
            mode="secure"
            result={secure}
            authDown={authDown}
            isLoading={loading}
            onAccess={() => handleAccess('secure')}
            onToggle={handleToggle}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            認証サービス停止時: 脆弱版はアクセスが許可されるか
          </li>
          <li>
            認証サービス停止時: 安全版は 503 でアクセスが拒否されるか
          </li>
          <li>Fail-Closed 設計の原則を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
