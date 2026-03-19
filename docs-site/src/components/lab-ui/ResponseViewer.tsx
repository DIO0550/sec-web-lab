import type { TextResponse, HeaderResponse } from '@site/src/hooks/useLabFetch';
import styles from './ResponseViewer.module.css';

// --- ヘッダー付きレスポンスの表示 ---

type HeaderViewerProps = {
  result: HeaderResponse | null;
  mode: 'vulnerable' | 'secure';
};

/**
 * JSON レスポンス + ヘッダーの表示コンポーネント
 */
export function HeaderViewer({ result, mode }: HeaderViewerProps) {
  if (!result) return <div className={styles.headerViewerWrapper} />;
  const isVuln = mode === 'vulnerable';
  return (
    <div className={styles.headerViewerWrapper}>
      <h4>レスポンスヘッダー</h4>
      <pre className={isVuln ? styles.preVuln : styles.preSecure}>
        {Object.entries(result.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')}
      </pre>
      <h4>レスポンスボディ</h4>
      <pre className={styles.preBody}>
        {JSON.stringify(result.body, null, 2)}
      </pre>
    </div>
  );
}

// --- テキストレスポンスの表示 ---

type TextViewerProps = {
  result: TextResponse | null;
};

/**
 * テキストレスポンスの表示コンポーネント
 */
export function TextViewer({ result }: TextViewerProps) {
  if (!result) return <div />;
  const isError = result.status >= 400;
  return (
    <div className={styles.textViewerWrapper}>
      <div>
        Status:{' '}
        <span className={isError ? styles.statusError : styles.statusOk}>
          {result.status}
        </span>
      </div>
      <pre className={isError ? styles.preError : styles.preNormal}>
        {result.body}
      </pre>
    </div>
  );
}

// --- JSON テキストレスポンスの表示（ErrorMessageLeakage 用） ---

type JsonTextViewerProps = {
  result: { status: number; body: string } | null;
};

/**
 * JSON 形式のテキストレスポンス表示
 */
export function JsonTextViewer({ result }: JsonTextViewerProps) {
  if (!result) return <div />;
  const isError = result.status >= 400;
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(result.body), null, 2);
  } catch {
    formatted = result.body;
  }
  return (
    <div className={styles.jsonWrapper}>
      <span className={isError ? styles.jsonStatusError : styles.jsonStatusOk}>
        {result.status}
      </span>
      <pre className={isError ? styles.jsonPreError : styles.jsonPreOk}>
        {formatted}
      </pre>
    </div>
  );
}
