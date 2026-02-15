import { Hono } from "hono";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: Error Message Leakage
// エラーメッセージからの情報漏洩
// ========================================

// --- 脆弱バージョン ---
// ⚠️ エラーの詳細（SQL文、テーブル名、スタックトレース）をそのまま返す
// 攻撃者はこの情報でDB構造を把握し、SQLインジェクションの精度を向上させられる

app.get("/vulnerable/users/:id", async (c) => {
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
app.get("/vulnerable/", (c) => {
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

// --- 安全バージョン ---
// ✅ パラメータバリデーション + パラメータ化クエリ + 汎用エラーメッセージ

app.get("/secure/users/:id", async (c) => {
  const id = c.req.param("id");
  const pool = getPool();

  // ✅ 入力値のバリデーション: 数値のみ許可
  if (!/^\d+$/.test(id)) {
    return c.json({ error: "ユーザーIDは数値で指定してください" }, 400);
  }

  try {
    // ✅ パラメータ化クエリを使用（SQLインジェクション対策）
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(result.rows[0]);
  } catch (err) {
    // ✅ エラーの詳細はサーバーログにのみ記録
    console.error("Internal error:", (err as Error).message);

    // ✅ クライアントには汎用メッセージだけを返す
    return c.json({ error: "処理中にエラーが発生しました" }, 500);
  }
});

// 安全バージョンのインデックス
app.get("/secure/", (c) => {
  return c.json({
    message: "これは安全なエンドポイントです",
    hint: "同じ不正入力を送っても、内部情報は漏洩しません",
    examples: [
      {
        path: "/api/labs/error-message-leakage/secure/users/1",
        description: "正常なリクエスト（ユーザーID: 1）",
      },
      {
        path: "/api/labs/error-message-leakage/secure/users/abc",
        description: "文字列を送信 → バリデーションエラー",
      },
      {
        path: "/api/labs/error-message-leakage/secure/users/'",
        description: "シングルクォート → バリデーションエラー",
      },
    ],
  });
});

export default app;
