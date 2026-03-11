import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ 認証バイパス: ユーザー入力を文字列結合でSQL文に埋め込む
// ' OR 1=1 -- でパスワード検証をバイパスできる
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  try {
    // ⚠️ 文字列結合によるSQL組み立て — SQLインジェクションの脆弱性
    // username に ' OR 1=1 -- を入力すると:
    // SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = 'anything'
    // OR 1=1 が常に真になり、全ユーザーが返される
    const query = `SELECT id, username, email, role FROM users WHERE username = '${username}' AND password = '${password}'`;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    // 最初のレコード（多くの場合 admin）でログイン成功とみなす
    const user = result.rows[0];
    return c.json({
      success: true,
      message: `${user.username} としてログインしました`,
      user,
      // ⚠️ 実行されたSQLも返す（学習目的）
      _debug: { query, rowCount: result.rows.length },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({
      success: false,
      message: "エラーが発生しました",
      error: error.message,
    }, 500);
  }
});

// ⚠️ データ抽出: UNION SELECT で他テーブルのデータを取得できる
// ' UNION SELECT username, password FROM users -- で全ユーザーの認証情報が漏洩
app.get("/search", async (c) => {
  const q = c.req.query("q") ?? "";
  const pool = getPool();

  try {
    // ⚠️ 文字列結合によるSQL組み立て — UNION INJECTIONの脆弱性
    // q に ' UNION SELECT username, password FROM users -- を入力すると:
    // SELECT title, content FROM posts WHERE title LIKE '%' UNION SELECT username, password FROM users --%'
    const query = `SELECT title, content FROM posts WHERE title LIKE '%${q}%'`;
    const result = await pool.query(query);

    return c.json({
      results: result.rows,
      count: result.rows.length,
      // ⚠️ 実行されたSQLも返す（学習目的）
      _debug: { query },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({
      results: [],
      count: 0,
      error: error.message,
    }, 500);
  }
});

export default app;
