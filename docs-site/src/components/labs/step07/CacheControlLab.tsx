import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './CacheControlLab.module.css';

const BASE = '/api/labs/cache-control';

type CacheResult = {
  success: boolean;
  profile?: Record<string, string>;
  headers?: Record<string, string>;
  _debug?: { message: string; risks?: string[] };
};

function CachePanel({
  result,
  isLoading,
  onTest,
}: {
  result: CacheResult | null;
  isLoading: boolean;
  onTest: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onTest} disabled={isLoading}>
        プロフィール取得
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultBox}>
          {result?.profile && (
            <div>
              <div className={styles.sectionTitle}>個人情報:</div>
              <pre className={styles.pre}>
                {JSON.stringify(result.profile, null, 2)}
              </pre>
            </div>
          )}
          {result?.headers && (
            <div className={styles.headerSection}>
              <div className={styles.sectionTitle}>キャッシュ制御ヘッダー:</div>
              <pre className={styles.pre}>
                {Object.entries(result.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n')}
              </pre>
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
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * キャッシュ制御の不備ラボUI
 *
 * Cache-Controlヘッダー未設定による機密データのキャッシュ残存を体験する。
 */
export function CacheControlLab() {
  const [vulnerable, setVulnerable] = useState<CacheResult | null>(null);
  const [secure, setSecure] = useState<CacheResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile`);
      const data: CacheResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch {
      const fallback: CacheResult = { success: false };
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
          <CachePanel
            result={vulnerable}
            isLoading={loading}
            onTest={() => handleTest('vulnerable')}
          />
        }
        secureContent={
          <CachePanel
            result={secure}
            isLoading={loading}
            onTest={() => handleTest('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: Cache-Control ヘッダーが未設定か</li>
          <li>
            安全版: no-store, no-cache, must-revalidate, private
            が設定されているか
          </li>
          <li>共有PCやCDNでのキャッシュ残存リスクを理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
