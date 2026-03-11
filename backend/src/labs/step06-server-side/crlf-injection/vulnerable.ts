import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ユーザー入力をHTTPヘッダーに直接設定
// \r\n を含む入力で任意のヘッダーを注入できる
app.get("/redirect", (c) => {
  const url = c.req.query("url") || "/";

  // ⚠️ ユーザー入力をヘッダー値に直接設定
  // 例: url=http://example.com%0d%0aSet-Cookie:%20admin=true
  // → Location ヘッダー後に Set-Cookie ヘッダーが注入される
  c.header("Location", url);

  // シミュレーション: 改行コードの検出
  const hasCRLF = url.includes("\r") || url.includes("\n") ||
    url.includes("%0d") || url.includes("%0a") ||
    url.includes("%0D") || url.includes("%0A");

  // ヘッダーインジェクションのシミュレーション結果
  const injectedHeaders: string[] = [];
  if (hasCRLF) {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split(/\r\n|\r|\n/);
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].trim()) {
        injectedHeaders.push(parts[i].trim());
      }
    }
  }

  return c.json({
    success: true,
    action: "redirect",
    locationHeader: url,
    _debug: {
      message: hasCRLF
        ? "CRLF検出: ヘッダーインジェクションが可能な入力です"
        : "通常のリダイレクト",
      crlfDetected: hasCRLF,
      injectedHeaders,
    },
  });
});

// ⚠️ ユーザー入力をカスタムヘッダーに反映
app.get("/log", (c) => {
  const username = c.req.query("username") || "anonymous";

  // ⚠️ ユーザー名をそのままヘッダーに設定
  c.header("X-User", username);

  return c.json({
    success: true,
    message: `ログ記録: ${username}`,
    headers: { "X-User": username },
    _debug: {
      message: "ユーザー入力をHTTPヘッダーに直接設定しています",
    },
  });
});

export default app;
