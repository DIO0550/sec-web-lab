import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ユーザー一覧: パスワードを平文のまま返す
// DBが漏洩した場合と同じ状況をシミュレート
app.get("/users", async (c) => {
  const pool = getPool();
  try {
    // ⚠️ パスワードカラムをそのまま返す — 平文で保存されているため丸見え
    const result = await pool.query(
      "SELECT id, username, password, email, role FROM users"
    );
    return c.json({
      users: result.rows,
      _debug: {
        message: "パスワードが平文で保存されています。DBが漏洩すると全パスワードが即座に悪用可能です。",
      },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ error: error.message }, 500);
  }
});

// ⚠️ ログイン: パスワードを平文で直接比較
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    // ⚠️ パスワードを平文で直接比較 — WHERE句でそのまま照合
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
