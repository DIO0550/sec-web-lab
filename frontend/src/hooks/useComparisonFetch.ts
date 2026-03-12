import { useState, useCallback } from "react";

type Mode = "vulnerable" | "secure";

/**
 * 脆弱/安全エンドポイントの比較テスト用フック
 *
 * 各ラボで繰り返される「vulnerable と secure の結果を別々に管理し、
 * mode に応じて振り分ける」パターンを共通化する。
 *
 * @example
 * const login = useComparisonFetch<LoginResult>("/api/labs/sql-injection");
 *
 * // POST リクエスト
 * await login.postJson("vulnerable", "/login", { username, password });
 *
 * // GET リクエスト
 * await login.run("vulnerable", "/search?q=test");
 *
 * // 結果参照
 * login.vulnerable  // 脆弱版の結果
 * login.secure      // 安全版の結果
 * login.loading     // ローディング状態
 */
export function useComparisonFetch<T>(basePath: string) {
  const [vulnerable, setVulnerable] = useState<T | null>(null);
  const [secure, setSecure] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  /** 結果をモードに応じてセットする */
  const setResult = useCallback((mode: Mode, data: T) => {
    if (mode === "vulnerable") setVulnerable(data);
    else setSecure(data);
  }, []);

  /**
   * 任意の fetch を実行し、結果を mode に応じて振り分ける
   * エラー時は onError で結果を生成するか、throw する
   */
  const run = useCallback(
    async (
      mode: Mode,
      subPath: string,
      init?: RequestInit,
      onError?: (e: Error) => T
    ): Promise<T> => {
      setLoading(true);
      try {
        const res = await fetch(`${basePath}/${mode}${subPath}`, init);
        const data: T = await res.json();
        setResult(mode, data);
        return data;
      } catch (e) {
        if (onError) {
          const errResult = onError(e as Error);
          setResult(mode, errResult);
          return errResult;
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [basePath, setResult]
  );

  /** POST + JSON body で run を実行する */
  const postJson = useCallback(
    async (
      mode: Mode,
      subPath: string,
      body: unknown,
      onError?: (e: Error) => T
    ): Promise<T> => {
      return run(
        mode,
        subPath,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        onError
      );
    },
    [run]
  );

  /** 結果をリセットする */
  const reset = useCallback(() => {
    setVulnerable(null);
    setSecure(null);
  }, []);

  return {
    vulnerable,
    secure,
    loading,
    setResult,
    run,
    postJson,
    reset,
  };
}
