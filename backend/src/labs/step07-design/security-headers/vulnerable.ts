import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ セキュリティヘッダーが一切設定されていない
app.get("/page", (c) => {
  return c.json({
    success: true,
    content: "このページにはセキュリティヘッダーが設定されていません",
    _debug: {
      message: "セキュリティヘッダー未設定: XSS・クリックジャッキング・MIMEスニッフィング等の攻撃に脆弱",
      missingHeaders: [
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Strict-Transport-Security",
        "X-XSS-Protection",
        "Referrer-Policy",
        "Permissions-Policy",
      ],
    },
  });
});

export default app;
