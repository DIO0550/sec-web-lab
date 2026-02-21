import { Hono } from "hono";
import { randomUUID } from "crypto";

const app = new Hono();

// ========================================
// Lab: Password Reset Token
// パスワードリセットトークンが推測可能
// ========================================

// --- 脆弱バージョン ---

let vulnCounter = 0;
const vulnTokens = new Map<string, { email: string; createdAt: number }>();

// ⚠️ 連番でトークンを生成 — 推測可能
app.post("/vulnerable/reset-request", async (c) => {
  const body = await c.req.json<{ email: string }>();
  const { email } = body;

  if (!email) {
    return c.json({ success: false, message: "メールアドレスを入力してください" }, 400);
  }

  // ⚠️ 連番トークン — 推測可能（0001, 0002, ...）
  vulnCounter++;
  const token = String(vulnCounter).padStart(4, "0");
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
app.post("/vulnerable/reset-confirm", async (c) => {
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

// --- 安全バージョン ---

const secureTokens = new Map<string, { email: string; createdAt: number; used: boolean }>();
const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30分

// ✅ crypto.randomUUID() で推測不可能なトークンを生成
app.post("/secure/reset-request", async (c) => {
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
app.post("/secure/reset-confirm", async (c) => {
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

// リセット
app.post("/reset", (c) => {
  vulnCounter = 0;
  vulnTokens.clear();
  secureTokens.clear();
  return c.json({ message: "リセットしました" });
});

export default app;
