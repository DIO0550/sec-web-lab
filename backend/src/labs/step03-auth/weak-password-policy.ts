import { Hono } from "hono";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: Weak Password Policy
// 弱いパスワードの登録を許してしまう
// ========================================

// よく使われるパスワードのブラックリスト
const COMMON_PASSWORDS = new Set([
  "123456", "password", "123456789", "qwerty", "abc123",
  "password1", "admin", "letmein", "welcome", "admin123",
  "monkey", "dragon", "master", "login", "princess",
  "1234567", "12345678", "1234567890", "iloveyou", "sunshine",
]);

// --- 脆弱バージョン ---

// ⚠️ ユーザー登録: パスワードの強度チェックが一切ない
app.post("/vulnerable/register", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username) {
    return c.json({ success: false, message: "ユーザー名を入力してください" }, 400);
  }

  // ⚠️ パスワードの存在チェックのみ — 強度は確認しない
  // "123456" も "a" も受け入れてしまう
  if (!password) {
    return c.json({ success: false, message: "パスワードは必須です" }, 400);
  }

  try {
    // 既存ユーザーのチェック
    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existing.rows.length > 0) {
      return c.json({ success: false, message: "このユーザー名は既に使用されています" }, 409);
    }

    await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
      [username, password, `${username}@example.com`]
    );

    return c.json({
      success: true,
      message: `ユーザー "${username}" を登録しました`,
      _debug: {
        passwordLength: password.length,
        message: `パスワード "${password}" がそのまま受理されました。強度チェックはありません。`,
      },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ success: false, message: "エラーが発生しました", error: error.message }, 500);
  }
});

// ⚠️ ログイン（脆弱版登録ユーザー用）
app.post("/vulnerable/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    return c.json({
      success: true,
      message: `${result.rows[0].username} としてログインしました`,
      user: result.rows[0],
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ success: false, message: "エラーが発生しました", error: error.message }, 500);
  }
});

// --- 安全バージョン ---

// ✅ パスワード強度チェック関数
function validatePassword(password: string): { valid: boolean; reason?: string } {
  if (!password) {
    return { valid: false, reason: "パスワードは必須です" };
  }
  if (password.length < 8) {
    return { valid: false, reason: "パスワードは8文字以上必要です" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: "大文字を1文字以上含めてください" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: "小文字を1文字以上含めてください" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "数字を1文字以上含めてください" };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, reason: "よく使われるパスワードは使用できません" };
  }
  return { valid: true };
}

// ✅ パスワード強度チェック（フロントエンド連携用）
app.post("/secure/check-strength", async (c) => {
  const body = await c.req.json<{ password: string }>();
  const { password } = body;

  const result = validatePassword(password);
  return c.json({
    password: password.replace(/./g, "*"),
    length: password?.length ?? 0,
    ...result,
  });
});

// ✅ ユーザー登録: パスワード強度チェックあり
app.post("/secure/register", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username) {
    return c.json({ success: false, message: "ユーザー名を入力してください" }, 400);
  }

  // ✅ パスワード強度を検証
  const check = validatePassword(password);
  if (!check.valid) {
    return c.json({ success: false, message: check.reason }, 400);
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existing.rows.length > 0) {
      return c.json({ success: false, message: "このユーザー名は既に使用されています" }, 409);
    }

    await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
      [username, password, `${username}@example.com`]
    );

    return c.json({
      success: true,
      message: `ユーザー "${username}" を登録しました（強力なパスワードで保護されています）`,
    });
  } catch (err) {
    console.error("Register error:", (err as Error).message);
    return c.json({ success: false, message: "処理中にエラーが発生しました" }, 500);
  }
});

// ✅ ログイン（安全版登録ユーザー用）
app.post("/secure/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    return c.json({
      success: true,
      message: `${result.rows[0].username} としてログインしました`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Login error:", (err as Error).message);
    return c.json({ success: false, message: "処理中にエラーが発生しました" }, 500);
  }
});

export default app;
