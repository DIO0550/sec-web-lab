import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ X-Frame-Options ヘッダーなし — iframe埋め込み可能
app.get("/target", (c) => {
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
app.post("/transfer", async (c) => {
  const body = await c.req.json<{ amount: number; to: string }>();
  return c.json({
    success: true,
    message: `${body.to} に ¥${body.amount?.toLocaleString()} を送金しました`,
    _debug: {
      message: "ユーザーは透明なiframeの裏でこのボタンをクリックさせられた可能性がある",
    },
  });
});

export default app;
