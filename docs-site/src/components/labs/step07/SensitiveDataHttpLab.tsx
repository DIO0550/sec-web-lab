import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './SensitiveDataHttpLab.module.css';

const BASE = '/api/labs/sensitive-data-http';

type LoginResult = {
  success: boolean;
  message: string;
  _debug?: { message: string; cookie?: string; risks?: string[] };
  protectedHeaders?: Record<string, string>;
};

function HttpPanel({
  result,
  isLoading,
  onLogin,
}: {
  result: LoginResult | null;
  isLoading: boolean;
  onLogin: () => void;
}) {
  return (
    <div>
      <p className={styles.hint}>admin / admin123 でログイン</p>
      <FetchButton onClick={onLogin} disabled={isLoading}>
        ログイン送信
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div
          className={`${styles.resultBox} ${result?.success ? styles.resultSuccess : styles.resultError}`}
        >
          <div className={styles.resultTitle}>{result?.message}</div>
          {result?._debug && (
            <div className={styles.debugSection}>
              <div className={styles.debugMessage}>
                {result._debug.message}
              </div>
              {result._debug.cookie && (
                <div className={styles.cookieDisplay}>
                  {result._debug.cookie}
                </div>
              )}
              {result._debug.risks && (
                <ul className={styles.riskList}>
                  {result._debug.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {result?.protectedHeaders && (
            <pre className={styles.headersPre}>
              {JSON.stringify(result.protectedHeaders, null, 2)}
            </pre>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * HTTPでの機密データ送信ラボUI
 *
 * HSTS未設定やCookie Secure属性の欠如による平文通信の脆弱性を体験する。
 */
export function SensitiveDataHttpLab() {
  const [vulnerable, setVulnerable] = useState<LoginResult | null>(null);
  const [secure, setSecure] = useState<LoginResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });
      const data: LoginResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch (e) {
      const fallback: LoginResult = {
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
          <HttpPanel
            result={vulnerable}
            isLoading={loading}
            onLogin={() => handleLogin('vulnerable')}
          />
        }
        secureContent={
          <HttpPanel
            result={secure}
            isLoading={loading}
            onLogin={() => handleLogin('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: CookieにSecure属性が設定されていないか</li>
          <li>
            安全版: HSTS + Secure + HttpOnly + SameSite が設定されているか
          </li>
          <li>HTTPS の強制とCookie属性の関係を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
