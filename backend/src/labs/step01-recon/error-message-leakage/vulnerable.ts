import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---
// ⚠️ エラーの詳細（SQL文、テーブル名、スタックトレース）をそのまま返す
// 攻撃者はこの情報でDB構造を把握し、SQLインジェクションの精度を向上させられる

app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const pool = getPool();

  try {
    // ⚠️ ユーザー入力をSQL文に直接埋め込む（SQLインジェクションの脆弱性あり）
    // さらにエラーが発生した場合、詳細をそのまま返す
    const result = await pool.query(
      `SELECT id, username, email, role FROM users WHERE id = ${id}`
    );
    if (result.rows.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(result.rows[0]);
  } catch (err) {
    const error = err as Error & { stack?: string };
    // ⚠️ エラーの全文をそのままクライアントに返す（脆弱）
    // テーブル名、カラム名、SQL文、ファイルパスが漏洩する
    return c.json(
      {
        error: error.message,
        stack: error.stack,
        hint: "この詳細なエラー情報は攻撃者にとって非常に有用です",
      },
      500
    );
  }
});

// 脆弱バージョンのインデックス
app.get("/", (c) => {
  return c.json({
    message: "これは脆弱なエンドポイントです",
    hint: "不正な入力でエラーを誘発してみてください",
    examples: [
      {
        path: "/api/labs/error-message-leakage/vulnerable/users/1",
        description: "正常なリクエスト（ユーザーID: 1）",
      },
      {
        path: "/api/labs/error-message-leakage/vulnerable/users/abc",
        description: "文字列を送信してエラーを誘発",
      },
      {
        path: "/api/labs/error-message-leakage/vulnerable/users/'",
        description: "シングルクォートでSQLエラーを誘発",
      },
    ],
  });
});

export default app;
