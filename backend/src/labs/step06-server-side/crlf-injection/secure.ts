import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 改行コードを除去してからヘッダーに設定
app.get("/redirect", (c) => {
  const url = c.req.query("url") || "/";

  // ✅ 改行コード（CR, LF）を除去
  const sanitizedUrl = url.replace(/[\r\n%0d%0a]/gi, "");

  // ✅ URLの形式を検証
  try {
    const parsed = new URL(sanitizedUrl, "http://localhost");
    // ✅ 同一ドメインのみ許可（オープンリダイレクト防止も兼ねる）
    if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      return c.json({
        success: false,
        message: "外部サイトへのリダイレクトは許可されていません",
      }, 400);
    }
  } catch {
    // 相対パスの場合はそのまま使用
  }

  c.header("Location", sanitizedUrl);

  return c.json({
    success: true,
    action: "redirect",
    locationHeader: sanitizedUrl,
    sanitized: url !== sanitizedUrl,
  });
});

// ✅ 改行コードを除去してからヘッダーに設定
app.get("/log", (c) => {
  const username = c.req.query("username") || "anonymous";

  // ✅ 改行コードと制御文字を除去
  const sanitizedUsername = username.replace(/[\r\n\x00-\x1f]/g, "");

  c.header("X-User", sanitizedUsername);

  return c.json({
    success: true,
    message: `ログ記録: ${sanitizedUsername}`,
    headers: { "X-User": sanitizedUsername },
    sanitized: username !== sanitizedUsername,
  });
});

export default app;
