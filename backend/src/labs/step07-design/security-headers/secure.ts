import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 推奨されるセキュリティヘッダーをすべて設定
app.get("/page", (c) => {
  // ✅ Content Security Policy — インラインスクリプト・外部リソース読み込みを制限
  c.header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self'");
  // ✅ MIMEスニッフィング防止
  c.header("X-Content-Type-Options", "nosniff");
  // ✅ iframe埋め込み防止（クリックジャッキング対策）
  c.header("X-Frame-Options", "DENY");
  // ✅ HTTPS強制
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // ✅ リファラー情報の制限
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  // ✅ ブラウザ機能の制限
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return c.json({
    success: true,
    content: "このページにはセキュリティヘッダーが設定されています",
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self'...",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  });
});

export default app;
