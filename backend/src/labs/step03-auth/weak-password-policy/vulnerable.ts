import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ユーザー登録: パスワードの強度チェックが一切ない
app.post("/register", async (c) => {
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
app.post("/login", async (c) => {
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

export default app;
