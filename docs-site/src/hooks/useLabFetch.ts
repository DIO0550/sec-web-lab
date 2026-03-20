import { useState, useCallback } from 'react';

// --- 型定義 ---

/** ヘッダー付きJSON レスポンス */
export type HeaderResponse = {
  headers: Record<string, string>;
  body: Record<string, unknown>;
};

/** テキストレスポンス（ステータス + 本文） */
export type TextResponse = {
  status: number;
  contentType: string;
  body: string;
};

// --- fetch ユーティリティ ---

/** レスポンスヘッダーを Record に変換 */
function extractHeaders(res: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

/** JSON + ヘッダーを取得 */
export async function fetchJsonWithHeaders(url: string): Promise<HeaderResponse> {
  const res = await fetch(url);
  const headers = extractHeaders(res);
  const body = await res.json();
  return { headers, body };
}

/** テキスト + ステータスを取得 */
export async function fetchText(url: string): Promise<TextResponse> {
  const res = await fetch(url);
  const body = await res.text();
  return {
    status: res.status,
    contentType: res.headers.get('content-type') ?? '',
    body,
  };
}

/** JSON POST リクエスト（ステータスコード + レスポンスボディを返す） */
export async function postJson<T>(
  url: string,
  body: unknown,
): Promise<{ status: number; body: T }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, body: json as T };
}

// --- カスタムフック ---

/**
 * ラボの脆弱/安全エンドポイントを比較テストするフック
 *
 * frontend/ 版との差分: fetch失敗時に error ステートを返す
 */
export function useLabFetch<T>(
  basePath: string,
  fetcher: (url: string) => Promise<T>,
) {
  const [vulnerable, setVulnerable] = useState<T | null>(null);
  const [secure, setSecure] = useState<T | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVulnerable = useCallback(
    async (subPath = '') => {
      const key = `vulnerable-${subPath}`;
      setLoading(key);
      setError(null);
      try {
        const result = await fetcher(`${basePath}/vulnerable${subPath}`);
        setVulnerable(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`脆弱版の取得に失敗しました: ${msg}`);
      }
      setLoading(null);
    },
    [basePath, fetcher],
  );

  const fetchSecure = useCallback(
    async (subPath = '') => {
      const key = `secure-${subPath}`;
      setLoading(key);
      setError(null);
      try {
        const result = await fetcher(`${basePath}/secure${subPath}`);
        setSecure(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`安全版の取得に失敗しました: ${msg}`);
      }
      setLoading(null);
    },
    [basePath, fetcher],
  );

  const isLoading = loading !== null;

  return { vulnerable, secure, loading, isLoading, error, fetchVulnerable, fetchSecure };
}

/**
 * 複数のテストケースを脆弱/安全で比較するフック
 *
 * frontend/ 版との差分: fetch失敗時に error ステートを返す
 */
export function useMultiTest<T>(
  basePath: string,
  fetcher: (url: string) => Promise<T>,
  testPaths: string[],
) {
  const [vulnerableResults, setVulnerableResults] = useState<Record<string, T>>({});
  const [secureResults, setSecureResults] = useState<Record<string, T>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(
    async (mode: 'vulnerable' | 'secure', subPath: string) => {
      setLoading(`${mode}-${subPath}`);
      setError(null);
      try {
        const result = await fetcher(`${basePath}/${mode}/${subPath}`);
        if (mode === 'vulnerable') {
          setVulnerableResults((prev) => ({ ...prev, [subPath]: result }));
        } else {
          setSecureResults((prev) => ({ ...prev, [subPath]: result }));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`テストに失敗しました: ${msg}`);
      }
      setLoading(null);
    },
    [basePath, fetcher],
  );

  const runAll = useCallback(
    async (mode: 'vulnerable' | 'secure') => {
      setLoading(`all-${mode}`);
      setError(null);
      for (const subPath of testPaths) {
        try {
          const result = await fetcher(`${basePath}/${mode}/${subPath}`);
          if (mode === 'vulnerable') {
            setVulnerableResults((prev) => ({ ...prev, [subPath]: result }));
          } else {
            setSecureResults((prev) => ({ ...prev, [subPath]: result }));
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          setError(`テストに失敗しました: ${msg}`);
          break;
        }
      }
      setLoading(null);
    },
    [basePath, fetcher, testPaths],
  );

  const isLoading = loading !== null;

  return { vulnerableResults, secureResults, loading, isLoading, error, runTest, runAll };
}
