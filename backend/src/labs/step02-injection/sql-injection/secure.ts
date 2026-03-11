import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ パラメータ化クエリで認証 — 入力値は常にリテラル値として扱われる
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  // ✅ 入力値のバリデーション
  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    // ✅ パラメータ化クエリ — $1, $2 がプレースホルダとして機能
    // ユーザー入力はクエリのコンパイル後にバインドされるため、
    // ' OR 1=1 -- が入力されても「' OR 1=1 --」という文字列を検索するだけ
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    const user = result.rows[0];
    return c.json({
      success: true,
      message: `${user.username} としてログインしました`,
      user,
    });
  } catch (err) {
    // ✅ エラーの詳細はサーバーログにのみ記録
    console.error("Login error:", (err as Error).message);
    return c.json({ success: false, message: "処理中にエラーが発生しました" }, 500);
  }
});

// ✅ パラメータ化クエリで検索 — UNION INJECTIONを防止
app.get("/search", async (c) => {
  const q = c.req.query("q") ?? "";
  const pool = getPool();

  try {
    // ✅ パラメータ化クエリ — $1 がプレースホルダとして機能
    // UNION SELECT が入力されても、LIKEパターンの一部として文字列検索されるだけ
    const result = await pool.query(
      "SELECT title, content FROM posts WHERE title LIKE '%' || $1 || '%'",
      [q]
    );

    return c.json({
      results: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error("Search error:", (err as Error).message);
    return c.json({ results: [], count: 0, message: "検索中にエラーが発生しました" }, 500);
  }
});

export default app;
