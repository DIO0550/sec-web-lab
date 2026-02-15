import { useState } from "react";

type HeaderResult = {
  headers: Record<string, string>;
  body: Record<string, unknown>;
} | null;

export function HeaderLeakage() {
  const [vulnerableResult, setVulnerableResult] = useState<HeaderResult>(null);
  const [secureResult, setSecureResult] = useState<HeaderResult>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchWithHeaders = async (url: string): Promise<HeaderResult> => {
    const res = await fetch(url);
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const body = await res.json();
    return { headers, body };
  };

  const handleFetchVulnerable = async () => {
    setLoading("vulnerable");
    try {
      const result = await fetchWithHeaders("/api/labs/header-leakage/vulnerable/");
      setVulnerableResult(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const handleFetchSecure = async () => {
    setLoading("secure");
    try {
      const result = await fetchWithHeaders("/api/labs/header-leakage/secure/");
      setSecureResult(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  return (
    <div>
      <h2>HTTP Header Information Leakage</h2>
      <p>HTTPレスポンスヘッダーからの情報漏洩</p>
      <p style={{ color: "#666" }}>
        <code>X-Powered-By</code>, <code>Server</code> 等のヘッダーから技術スタックが特定される脆弱性です。
      </p>

      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        {/* 脆弱バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#c00" }}>脆弱バージョン</h3>
          <p><code>GET /api/labs/header-leakage/vulnerable/</code></p>
          <button onClick={handleFetchVulnerable} disabled={loading !== null}>
            {loading === "vulnerable" ? "送信中..." : "リクエスト送信"}
          </button>

          {vulnerableResult && (
            <div style={{ marginTop: 16 }}>
              <h4>レスポンスヘッダー</h4>
              <pre style={{ background: "#1a1a2e", color: "#e94560", padding: 12, borderRadius: 4, overflow: "auto" }}>
                {Object.entries(vulnerableResult.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join("\n")}
              </pre>
              <h4>レスポンスボディ</h4>
              <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 4, overflow: "auto" }}>
                {JSON.stringify(vulnerableResult.body, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 安全バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#080" }}>安全バージョン</h3>
          <p><code>GET /api/labs/header-leakage/secure/</code></p>
          <button onClick={handleFetchSecure} disabled={loading !== null}>
            {loading === "secure" ? "送信中..." : "リクエスト送信"}
          </button>

          {secureResult && (
            <div style={{ marginTop: 16 }}>
              <h4>レスポンスヘッダー</h4>
              <pre style={{ background: "#1a2e1a", color: "#4ecdc4", padding: 12, borderRadius: 4, overflow: "auto" }}>
                {Object.entries(secureResult.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join("\n")}
              </pre>
              <h4>レスポンスボディ</h4>
              <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 4, overflow: "auto" }}>
                {JSON.stringify(secureResult.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "#f0f0f0", borderRadius: 4 }}>
        <h3>確認ポイント</h3>
        <ul>
          <li>脆弱版: <code>X-Powered-By</code>, <code>Server</code>, <code>X-Runtime</code> 等のヘッダーが見えるか</li>
          <li>安全版: これらのヘッダーが削除され、代わりに <code>X-Content-Type-Options</code> が付与されているか</li>
          <li>ターミナルで <code>curl -I http://localhost:3000/api/labs/header-leakage/vulnerable/</code> も試してみよう</li>
        </ul>
      </div>
    </div>
  );
}
