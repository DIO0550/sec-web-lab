import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './StackTraceLab.module.css';

const BASE = '/api/labs/stack-trace';

type StackResult = {
  success: boolean;
  message?: string;
  error?: string;
  stack?: string;
  errorId?: string;
  debug?: Record<string, unknown>;
  _debug?: { message: string; risks?: string[] };
};

function StackPanel({
  mode,
  results,
  isLoading,
  onTest,
}: {
  mode: 'vulnerable' | 'secure';
  results: StackResult[];
  isLoading: boolean;
  onTest: (endpoint: string) => void;
}) {
  return (
    <div>
      <div className={styles.buttonRow}>
        <FetchButton onClick={() => onTest('error')} disabled={isLoading}>
          エラー発生
        </FetchButton>
        <FetchButton onClick={() => onTest('debug')} disabled={isLoading}>
          デバッグ情報
        </FetchButton>
      </div>
      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.resultList}>
          {results.map((r, i) => (
            <div key={i} className={styles.resultItem}>
              {r.error && <div className={styles.errorTitle}>{r.error}</div>}
              {r.message && <div>{r.message}</div>}
              {r.errorId && (
                <div className={styles.errorId}>Error ID: {r.errorId}</div>
              )}
              {r.stack && (
                <pre className={styles.stackBlock}>{r.stack}</pre>
              )}
              {r.debug && (
                <pre className={styles.debugBlock}>
                  {JSON.stringify(r.debug, null, 2)}
                </pre>
              )}
              {r._debug && (
                <div className={styles.debugText}>{r._debug.message}</div>
              )}
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * スタックトレース漏洩ラボUI
 *
 * スタックトレースやデバッグ情報がレスポンスに露出する脆弱性を体験する。
 */
export function StackTraceLab() {
  const [vulnResults, setVulnResults] = useState<StackResult[]>([]);
  const [secureResults, setSecureResults] = useState<StackResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTest = async (
    mode: 'vulnerable' | 'secure',
    endpoint: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/${endpoint}`);
      const data: StackResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, data]);
      } else {
        setSecureResults((prev) => [...prev, data]);
      }
    } catch (e) {
      const err: StackResult = {
        success: false,
        message: (e as Error).message,
      };
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, err]);
      } else {
        setSecureResults((prev) => [...prev, err]);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: スタックトレース漏洩</h3>
      <p className={styles.description}>
        脆弱版ではスタックトレースやデバッグ情報がレスポンスに含まれます。
        安全版ではエラーIDのみ返され、内部情報が隠蔽されます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <StackPanel
            mode="vulnerable"
            results={vulnResults}
            isLoading={loading}
            onTest={(e) => handleTest('vulnerable', e)}
          />
        }
        secureContent={
          <StackPanel
            mode="secure"
            results={secureResults}
            isLoading={loading}
            onTest={(e) => handleTest('secure', e)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版:
            スタックトレースやデバッグ情報がレスポンスに含まれるか
          </li>
          <li>
            安全版: エラーIDのみ返され内部情報が隠蔽されているか
          </li>
          <li>
            NODE_ENV=production でのエラーハンドリング設計を理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
