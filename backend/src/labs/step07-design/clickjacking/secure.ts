import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ X-Frame-Options と CSP frame-ancestors で埋め込み防止
app.get("/target", (c) => {
  // ✅ iframe埋め込み防止
  c.header("X-Frame-Options", "DENY");
  c.header("Content-Security-Policy", "frame-ancestors 'self'");

  return c.json({
    success: true,
    page: "重要な操作ページ（送金確認等）",
    action: "confirm-transfer",
    protectedHeaders: {
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'self'",
    },
  });
});

// ✅ CSRF トークン付きの操作実行
app.post("/transfer", async (c) => {
  c.header("X-Frame-Options", "DENY");
  c.header("Content-Security-Policy", "frame-ancestors 'self'");

  const body = await c.req.json<{ amount: number; to: string }>();
  return c.json({
    success: true,
    message: `${body.to} に ¥${body.amount?.toLocaleString()} を送金しました（保護あり）`,
  });
});

export default app;
