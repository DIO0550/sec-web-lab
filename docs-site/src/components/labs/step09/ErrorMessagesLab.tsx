import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './ErrorMessagesLab.module.css';

const BASE = '/api/labs/error-messages';

type ErrorResult = {
  success: boolean;
  message: string;
  stack?: string;
  user?: Record<string, unknown>;
  _debug?: { message: string };
};

function ErrorPanel({
  mode,
  results,
  isLoading,
  onTest,
}: {
  mode: 'vulnerable' | 'secure';
  results: ErrorResult[];
  isLoading: boolean;
  onTest: (action: string) => void;
}) {
  return (
    <div>
      <div className={styles.buttonRow}>
        <FetchButton onClick={() => onTest('user-exist')} disabled={isLoading}>
          存在するユーザー
        </FetchButton>
        <FetchButton
          onClick={() => onTest('user-notfound')}
          disabled={isLoading}
        >
          存在しないユーザー
        </FetchButton>
        <FetchButton
          onClick={() => onTest('login-nouser')}
          disabled={isLoading}
        >
          存在しないアカウント
        </FetchButton>
        <FetchButton
          onClick={() => onTest('login-wrongpw')}
          disabled={isLoading}
        >
          パスワード間違い
        </FetchButton>
      </div>

      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.resultList}>
          {results.map((r, i) => (
            <div
              key={i}
              className={
                r.success ? styles.resultItemSuccess : styles.resultItemError
              }
            >
              <div className={styles.resultMessage}>{r.message}</div>
              {r.stack && <pre className={styles.stackTrace}>{r.stack}</pre>}
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
 * 詳細エラーメッセージ露出ラボUI
 *
 * エラーメッセージに内部情報が含まれる脆弱性を体験する。
 */
export function ErrorMessagesLab() {
  const [vulnResults, setVulnResults] = useState<ErrorResult[]>([]);
  const [secureResults, setSecureResults] = useState<ErrorResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTest = async (
    mode: 'vulnerable' | 'secure',
    action: string,
  ) => {
    setLoading(true);
    try {
      let res: Response;
      switch (action) {
        case 'user-exist':
          res = await fetch(`${BASE}/${mode}/user/1`);
          break;
        case 'user-notfound':
          res = await fetch(`${BASE}/${mode}/user/9999`);
          break;
        case 'login-nouser':
          res = await fetch(`${BASE}/${mode}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'nonexistent',
              password: 'test',
            }),
          });
          break;
        case 'login-wrongpw':
          res = await fetch(`${BASE}/${mode}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'admin',
              password: 'wrongpass',
            }),
          });
          break;
        default:
          setLoading(false);
          return;
      }
      const data: ErrorResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, data]);
      } else {
        setSecureResults((prev) => [...prev, data]);
      }
    } catch (e) {
      const err: ErrorResult = {
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
      <h3>Lab: 詳細エラーメッセージ露出</h3>
      <p className={styles.description}>
        脆弱版ではエラーにDB構造やスタックトレースが含まれます。
        安全版ではすべてのエラーで一般的なメッセージのみ返されます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <ErrorPanel
            mode="vulnerable"
            results={vulnResults}
            isLoading={loading}
            onTest={(a) => handleTest('vulnerable', a)}
          />
        }
        secureContent={
          <ErrorPanel
            mode="secure"
            results={secureResults}
            isLoading={loading}
            onTest={(a) => handleTest('secure', a)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: エラーにテーブル名やクエリが含まれているか</li>
          <li>
            脆弱版:
            ユーザー不在とパスワード不一致で異なるメッセージが返るか
          </li>
          <li>安全版: すべてのエラーで一般的なメッセージのみ返されるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
