/**
 * API ユーティリティ関数
 *
 * fetch + JSON パースのボイラープレートを削減する。
 */

/** POST + JSON body で fetch し、レスポンスを JSON パースして返す */
export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

/** POST + JSON body + credentials: "include" で fetch する */
export async function postJsonWithCredentials<T>(
  url: string,
  body: unknown
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

/** GET で fetch し、レスポンスを JSON パースして返す */
export async function getJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  return res.json() as Promise<T>;
}
