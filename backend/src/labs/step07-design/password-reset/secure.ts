import { Hono } from "hono";
import { randomUUID } from "crypto";
import { secureTokens, TOKEN_EXPIRY_MS } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ crypto.randomUUID() で推測不可能なトークンを生成
app.post("/reset-request", async (c) => {
  const body = await c.req.json<{ email: string }>();
  const { email } = body;

  if (!email) {
    return c.json({ success: false, message: "メールアドレスを入力してください" }, 400);
  }

  // ✅ 暗号学的に安全なランダムトークン
  const token = randomUUID();
  secureTokens.set(token, { email, createdAt: Date.now(), used: false });

  return c.json({
    success: true,
    message: "パスワードリセットリンクを送信しました",
    // 本番ではトークンをレスポンスに含めない（メールで送信）
    _demo: { token },
  });
});

// ✅ 有効期限 + 使い回し防止
app.post("/reset-confirm", async (c) => {
  const body = await c.req.json<{ token: string; newPassword: string }>();
  const { token, newPassword } = body;

  const record = secureTokens.get(token);
  if (!record) {
    return c.json({ success: false, message: "無効なトークンです" }, 400);
  }

  // ✅ 有効期限チェック
  if (Date.now() - record.createdAt > TOKEN_EXPIRY_MS) {
    secureTokens.delete(token);
    return c.json({ success: false, message: "トークンの有効期限が切れています" }, 400);
  }

  // ✅ 使用済みチェック
  if (record.used) {
    return c.json({ success: false, message: "このトークンは既に使用されています" }, 400);
  }

  // ✅ トークンを使用済みにする
  record.used = true;

  return c.json({
    success: true,
    message: `${record.email} のパスワードをリセットしました`,
  });
});

export default app;
