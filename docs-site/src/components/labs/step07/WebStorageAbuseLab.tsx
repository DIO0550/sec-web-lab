import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './WebStorageAbuseLab.module.css';

const BASE = '/api/labs/web-storage-abuse';

type StorageResult = {
  success: boolean;
  message: string;
  token?: string;
  _debug?: { message: string; risks?: string[]; xssPayload?: string };
};

function StoragePanel({
  result,
  isLoading,
  onLogin,
}: {
  result: StorageResult | null;
  isLoading: boolean;
  onLogin: () => void;
}) {
  return (
    <div>
      <p className={styles.hint}>admin / admin123 でログイン</p>
      <FetchButton onClick={onLogin} disabled={isLoading}>
        ログイン
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div
          className={`${styles.resultBox} ${result?.success ? styles.resultSuccess : styles.resultError}`}
        >
          <div className={styles.resultTitle}>{result?.message}</div>
          {result?.token && (
            <div className={styles.tokenSection}>
              <div className={styles.tokenTitle}>
                レスポンスに含まれるトークン:
              </div>
              <pre className={styles.tokenPre}>{result.token}</pre>
              <div className={styles.tokenWarning}>
                フロントエンドがlocalStorage.setItem("token", ...)
                で保存する想定
              </div>
            </div>
          )}
          {!result?.token && result?.success && (
            <div className={styles.tokenSafe}>
              トークンはHttpOnly
              Cookieに保存（JavaScriptからアクセス不可）
            </div>
          )}
          {result?._debug && (
            <div className={styles.debugSection}>
              <div className={styles.debugMessage}>
                {result._debug.message}
              </div>
              {result._debug.risks && (
                <ul className={styles.riskList}>
                  {result._debug.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              {result._debug.xssPayload && (
                <div className={styles.xssSection}>
                  <div className={styles.xssTitle}>XSS窃取コード:</div>
                  <pre className={styles.xssPre}>
                    {result._debug.xssPayload}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * Web Storageの不適切な使用ラボUI
 *
 * localStorageへのトークン保存によるXSS窃取の脆弱性を体験する。
 */
export function WebStorageAbuseLab() {
  const [vulnerable, setVulnerable] = useState<StorageResult | null>(null);
  const [secure, setSecure] = useState<StorageResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });
      const data: StorageResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch (e) {
      const fallback: StorageResult = {
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
          <StoragePanel
            result={vulnerable}
            isLoading={loading}
            onLogin={() => handleLogin('vulnerable')}
          />
        }
        secureContent={
          <StoragePanel
            result={secure}
            isLoading={loading}
            onLogin={() => handleLogin('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版:
            トークンがレスポンスボディに含まれている（localStorageに保存される想定）か
          </li>
          <li>安全版: トークンがHttpOnly Cookieに設定されているか</li>
          <li>
            XSSがあった場合のlocalStorage vs HttpOnly
            Cookieの安全性の違いを理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
