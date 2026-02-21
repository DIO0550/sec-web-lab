import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Clickjacking (クリックジャッキング)
// 透明iframeによるUI偽装
// ========================================

// --- 脆弱バージョン ---

// ⚠️ X-Frame-Options ヘッダーなし — iframe埋め込み可能
app.get("/vulnerable/target", (c) => {
  // ⚠️ フレーム埋め込み防止ヘッダーが設定されていない
  return c.json({
    success: true,
    page: "重要な操作ページ（送金確認等）",
    action: "confirm-transfer",
    _debug: {
      message: "X-Frame-Options / CSP frame-ancestors 未設定: このページをiframeに埋め込める",
      headers: {
        "X-Frame-Options": "(未設定)",
        "Content-Security-Policy": "(未設定)",
      },
    },
  });
});

// ⚠️ 操作実行エンドポイント（iframe内で騙されてクリックされる）
app.post("/vulnerable/transfer", async (c) => {
  const body = await c.req.json<{ amount: number; to: string }>();
  return c.json({
    success: true,
    message: `${body.to} に ¥${body.amount?.toLocaleString()} を送金しました`,
    _debug: {
      message: "ユーザーは透明なiframeの裏でこのボタンをクリックさせられた可能性がある",
    },
  });
});

// --- 安全バージョン ---

// ✅ X-Frame-Options と CSP frame-ancestors で埋め込み防止
app.get("/secure/target", (c) => {
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
app.post("/secure/transfer", async (c) => {
  c.header("X-Frame-Options", "DENY");
  c.header("Content-Security-Policy", "frame-ancestors 'self'");

  const body = await c.req.json<{ amount: number; to: string }>();
  return c.json({
    success: true,
    message: `${body.to} に ¥${body.amount?.toLocaleString()} を送金しました（保護あり）`,
  });
});

export default app;
