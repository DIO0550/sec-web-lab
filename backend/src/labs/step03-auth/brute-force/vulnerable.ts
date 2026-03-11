import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ログイン: レート制限なし — 無制限にログイン試行が可能
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    // ⚠️ ログイン失敗を一切記録しない — 何度でも試行可能
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      // ⚠️ 失敗しても何のペナルティもなく、次の試行をそのまま受け付ける
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
