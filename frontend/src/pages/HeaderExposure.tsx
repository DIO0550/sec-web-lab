import { useState } from "react";

type HeaderResult = {
  headers: Record<string, string>;
  body: Record<string, unknown>;
} | null;

// チェックするセキュリティヘッダーの定義
const SECURITY_HEADERS = [
  {
    name: "X-Content-Type-Options",
    expected: "nosniff",
    description: "MIMEスニッフィング防止",
    attack: "ブラウザがContent-Typeを無視して中身を推測実行する",
  },
  {
    name: "X-Frame-Options",
    expected: "DENY",
    description: "クリックジャッキング防止",
    attack: "iframeに埋め込まれて意図しない操作をさせられる",
  },
  {
    name: "X-XSS-Protection",
    expected: "1; mode=block",
    description: "XSSフィルター (レガシー)",
    attack: "レガシーブラウザでXSSフィルターが動作しない",
  },
  {
    name: "Content-Security-Policy",
    expected: "default-src 'self'; script-src 'self'",
    description: "リソース読み込み制限",
    attack: "外部スクリプトの注入が容易になる",
  },
  {
    name: "Strict-Transport-Security",
    expected: "max-age=31536000; includeSubDomains",
    description: "HTTPS強制",
    attack: "中間者攻撃でHTTP通信を傍受される",
  },
  {
    name: "Referrer-Policy",
    expected: "strict-origin-when-cross-origin",
    description: "リファラー制御",
    attack: "URLのクエリパラメータ等が外部サイトに漏洩する",
  },
];

export function HeaderExposure() {
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

  const handleFetch = async (mode: "vulnerable" | "secure") => {
    setLoading(mode);
    try {
      const result = await fetchWithHeaders(`/api/labs/header-exposure/${mode}/`);
      if (mode === "vulnerable") {
        setVulnerableResult(result);
      } else {
        setSecureResult(result);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const renderHeaderCheck = (result: HeaderResult) => {
    if (!result) return null;
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
        <thead>
          <tr style={{ background: "#333", color: "#fff" }}>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>ヘッダー</th>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>値</th>
            <th style={{ padding: "6px 8px", textAlign: "center", width: 60 }}>状態</th>
          </tr>
        </thead>
        <tbody>
          {SECURITY_HEADERS.map((header) => {
            const value = result.headers[header.name.toLowerCase()];
            const isPresent = !!value;
            return (
              <tr key={header.name} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "6px 8px" }}>
                  <code>{header.name}</code>
                  <br />
                  <span style={{ fontSize: 11, color: "#888" }}>{header.description}</span>
                </td>
                <td style={{ padding: "6px 8px" }}>
                  {isPresent ? (
                    <code style={{ color: "#080" }}>{value}</code>
                  ) : (
                    <span style={{ color: "#c00", fontStyle: "italic" }}>未設定</span>
                  )}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center" }}>
                  {isPresent ? (
                    <span style={{ color: "#080", fontSize: 18 }}>OK</span>
                  ) : (
                    <span style={{ color: "#c00", fontSize: 18 }}>NG</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h2>Security Header Misconfiguration</h2>
      <p>セキュリティヘッダーの欠如による脆弱性</p>
      <p style={{ color: "#666" }}>
        ブラウザの保護機能を有効にするHTTPレスポンスヘッダーが設定されておらず、
        XSSやクリックジャッキング等の攻撃に対する防御層が欠けている脆弱性です。
      </p>

      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        {/* 脆弱バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#c00" }}>脆弱バージョン</h3>
          <p><code>GET /api/labs/header-exposure/vulnerable/</code></p>
          <button onClick={() => handleFetch("vulnerable")} disabled={loading !== null}>
            {loading === "vulnerable" ? "送信中..." : "ヘッダーを確認"}
          </button>
          {renderHeaderCheck(vulnerableResult)}
        </div>

        {/* 安全バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#080" }}>安全バージョン</h3>
          <p><code>GET /api/labs/header-exposure/secure/</code></p>
          <button onClick={() => handleFetch("secure")} disabled={loading !== null}>
            {loading === "secure" ? "送信中..." : "ヘッダーを確認"}
          </button>
          {renderHeaderCheck(secureResult)}
        </div>
      </div>

      {/* セキュリティヘッダー解説 */}
      <div style={{ marginTop: 32, padding: 16, background: "#fff8e1", borderRadius: 4 }}>
        <h3>各ヘッダーの役割</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>ヘッダー</th>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>欠如した場合のリスク</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_HEADERS.map((header) => (
              <tr key={header.name} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "6px 8px" }}><code>{header.name}</code></td>
                <td style={{ padding: "6px 8px" }}>{header.attack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, padding: 16, background: "#f0f0f0", borderRadius: 4 }}>
        <h3>確認ポイント</h3>
        <ul>
          <li>脆弱版: セキュリティヘッダーが全て「未設定」になっているか</li>
          <li>安全版: 全てのセキュリティヘッダーが「OK」になっているか</li>
          <li>ターミナルで <code>curl -I http://localhost:3000/api/labs/header-exposure/vulnerable/</code> も試してみよう</li>
          <li>注意: ブラウザの fetch API では一部のヘッダーが見えない場合があります。<code>curl -I</code> で正確に確認できます</li>
        </ul>
      </div>
    </div>
  );
}
