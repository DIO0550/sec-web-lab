import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ 詳細なエラーメッセージをそのまま返す
app.get("/user/:id", async (c) => {
  const id = c.req.param("id");
  const pool = getPool();

  try {
    const result = await pool.query("SELECT id, username, email FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      // ⚠️ テーブル名やカラム名を含む詳細なエラー
      return c.json({
        success: false,
        message: `ユーザー ID=${id} が users テーブルに見つかりません (SELECT id, username, email FROM users WHERE id = ${id})`,
        _debug: {
          message: "エラーメッセージにDB構造（テーブル名・カラム名・クエリ）が露出",
        },
      }, 404);
    }
    return c.json({ success: true, user: result.rows[0] });
  } catch (err) {
    // ⚠️ スタックトレースやDB接続情報を含むエラーをそのまま返す
    return c.json({
      success: false,
      message: `データベースエラー: ${(err as Error).message}`,
      stack: (err as Error).stack,
      _debug: {
        message: "内部エラーの詳細がレスポンスに含まれている",
      },
    }, 500);
  }
});

// ⚠️ ログイン時のユーザー存在確認
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  try {
    const userResult = await pool.query("SELECT id, username, password FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      // ⚠️ ユーザーが存在しないことを明示（ユーザー列挙攻撃に利用可能）
      return c.json({ success: false, message: `ユーザー "${username}" は登録されていません` }, 401);
    }
    if (userResult.rows[0].password !== password) {
      // ⚠️ パスワードが違うことを明示
      return c.json({ success: false, message: "パスワードが違います" }, 401);
    }
    return c.json({ success: true, message: "ログイン成功" });
  } catch (err) {
    return c.json({ success: false, message: `エラー: ${(err as Error).message}` }, 500);
  }
});

export default app;
