import { Hono } from "hono";
import { vulnState, vulnTokens } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ 連番でトークンを生成 — 推測可能
app.post("/reset-request", async (c) => {
  const body = await c.req.json<{ email: string }>();
  const { email } = body;

  if (!email) {
    return c.json({ success: false, message: "メールアドレスを入力してください" }, 400);
  }

  // ⚠️ 連番トークン — 推測可能（0001, 0002, ...）
  vulnState.counter++;
  const token = String(vulnState.counter).padStart(4, "0");
  vulnTokens.set(token, { email, createdAt: Date.now() });

  return c.json({
    success: true,
    message: `パスワードリセットリンクを送信しました`,
    _debug: {
      message: "トークンが連番: 推測可能。有効期限なし",
      token,
      totalTokens: vulnTokens.size,
    },
  });
});

// ⚠️ トークン検証 — 有効期限チェックなし
app.post("/reset-confirm", async (c) => {
  const body = await c.req.json<{ token: string; newPassword: string }>();
  const { token, newPassword } = body;

  const record = vulnTokens.get(token);
  if (!record) {
    return c.json({ success: false, message: "無効なトークンです" }, 400);
  }

  // ⚠️ 有効期限チェックなし
  // ⚠️ 使用済みフラグなし（トークンの再利用が可能）
  return c.json({
    success: true,
    message: `${record.email} のパスワードをリセットしました`,
    _debug: {
      message: "有効期限なし・使い回し可能なトークン",
      token,
      email: record.email,
    },
  });
});

export default app;
