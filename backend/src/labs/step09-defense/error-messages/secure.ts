import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 一般的なエラーメッセージのみ返す
app.get("/user/:id", async (c) => {
  const id = c.req.param("id");
  const pool = getPool();

  try {
    const result = await pool.query("SELECT id, username, email FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      // ✅ 内部情報を含まない一般的なメッセージ
      return c.json({ success: false, message: "リソースが見つかりません" }, 404);
    }
    return c.json({ success: true, user: result.rows[0] });
  } catch (err) {
    // ✅ 内部エラーの詳細はログに記録し、ユーザーには一般メッセージのみ返す
    console.error("Database error:", err);
    return c.json({ success: false, message: "内部エラーが発生しました" }, 500);
  }
});

// ✅ ユーザー存在を推測できないメッセージ
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  try {
    const userResult = await pool.query("SELECT id, username, password FROM users WHERE username = $1", [username]);
    // ✅ ユーザー不在でもパスワード不一致でも同じメッセージ
    if (userResult.rows.length === 0 || userResult.rows[0].password !== password) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが正しくありません" }, 401);
    }
    return c.json({ success: true, message: "ログイン成功" });
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ success: false, message: "内部エラーが発生しました" }, 500);
  }
});

export default app;
