import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './HttpMethodsLab.module.css';

const BASE = '/api/labs/http-methods';

type MethodResult = {
  success: boolean;
  message?: string;
  user?: Record<string, unknown>;
  method?: string;
  headers?: Record<string, string>;
  _debug?: { message: string };
};

function MethodPanel({
  results,
  isLoading,
  onRequest,
}: {
  results: MethodResult[];
  isLoading: boolean;
  onRequest: (method: string) => void;
}) {
  const methods = ['GET', 'PUT', 'DELETE', 'TRACE'];

  return (
    <div>
      <div className={styles.buttonRow}>
        {methods.map((m) => (
          <FetchButton key={m} onClick={() => onRequest(m)} disabled={isLoading}>
            {m}
          </FetchButton>
        ))}
      </div>

      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.resultScroll}>
          {results.map((r, i) => (
            <div
              key={i}
              className={`${styles.resultItem} ${r.success ? styles.resultSuccess : styles.resultError}`}
            >
              <span className={styles.methodName}>{r.method || ''}</span>:{' '}
              {r.message}
              {r._debug && (
                <div className={styles.debugMessage}>{r._debug.message}</div>
              )}
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * 不要なHTTPメソッド許可ラボUI
 *
 * PUT/DELETE/TRACE等の不要メソッドが許可されている脆弱性を体験する。
 */
export function HttpMethodsLab() {
  const [vulnResults, setVulnResults] = useState<MethodResult[]>([]);
  const [secureResults, setSecureResults] = useState<MethodResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (
    mode: 'vulnerable' | 'secure',
    method: string,
  ) => {
    setLoading(true);
    try {
      const options: RequestInit = { method };
      if (method === 'PUT') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ name: 'hacked', role: 'admin' });
      }
      const res = await fetch(`${BASE}/${mode}/users/2`, options);
      const data: MethodResult = await res.json();
      data.method = method;
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, data]);
      } else {
        setSecureResults((prev) => [...prev, data]);
      }
    } catch (e) {
      const err = { success: false, message: (e as Error).message, method };
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
      <ComparisonPanel
        vulnerableContent={
          <MethodPanel
            results={vulnResults}
            isLoading={loading}
            onRequest={(m) => handleRequest('vulnerable', m)}
          />
        }
        secureContent={
          <MethodPanel
            results={secureResults}
            isLoading={loading}
            onRequest={(m) => handleRequest('secure', m)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: PUT/DELETE/TRACE メソッドが成功するか</li>
          <li>安全版: 不要なメソッドに 405 が返されるか</li>
          <li>必要最小限のメソッドのみ許可する原則を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
