import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './SecurityHeadersLab.module.css';

const BASE = '/api/labs/security-headers';

type HeaderResult = {
  success: boolean;
  content?: string;
  headers?: Record<string, string>;
  _debug?: { message: string; missingHeaders?: string[] };
};

function HeaderPanel({
  result,
  isLoading,
  onTest,
}: {
  result: HeaderResult | null;
  isLoading: boolean;
  onTest: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onTest} disabled={isLoading}>
        ヘッダー確認
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultBox}>
          <div className={styles.sectionTitle}>レスポンス情報</div>
          {result?.headers && (
            <div>
              <div className={styles.headerTitle}>設定されたヘッダー:</div>
              <pre className={styles.pre}>
                {Object.entries(result.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n')}
              </pre>
            </div>
          )}
          {result?._debug?.missingHeaders && (
            <div className={styles.missingSection}>
              <div className={styles.missingTitle}>未設定のヘッダー:</div>
              <ul className={styles.missingList}>
                {result._debug.missingHeaders.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {result?._debug && (
            <div className={styles.debugMessage}>
              {result._debug.message}
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * セキュリティヘッダー未設定ラボUI
 *
 * CSP、HSTS等のセキュリティヘッダー未設定による多層防御の欠如を体験する。
 */
export function SecurityHeadersLab() {
  const [vulnerable, setVulnerable] = useState<HeaderResult | null>(null);
  const [secure, setSecure] = useState<HeaderResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/page`);
      const data: HeaderResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch {
      const fallback: HeaderResult = { success: false };
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
          <HeaderPanel
            result={vulnerable}
            isLoading={loading}
            onTest={() => handleTest('vulnerable')}
          />
        }
        secureContent={
          <HeaderPanel
            result={secure}
            isLoading={loading}
            onTest={() => handleTest('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: セキュリティヘッダーが一切返されていないか</li>
          <li>
            安全版: CSP, HSTS, X-Frame-Options 等が設定されているか
          </li>
          <li>各ヘッダーがどの攻撃を防ぐか理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
