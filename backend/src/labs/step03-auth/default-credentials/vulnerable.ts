import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---

// デフォルト認証情報のリスト（攻撃者が公開情報から入手できるもの）
const DEFAULT_CREDENTIALS = [
  { username: "admin", password: "admin123", source: "GitHub リポジトリの seed.ts" },
  { username: "admin", password: "admin", source: "一般的なデフォルト" },
  { username: "admin", password: "password", source: "一般的なデフォルト" },
  { username: "root", password: "root", source: "一般的なデフォルト" },
  { username: "admin", password: "1234", source: "一般的なデフォルト" },
];

// ⚠️ ログイン: デフォルトパスワードでもそのままログインが完了する
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    // ⚠️ デフォルトパスワードかどうかを一切チェックしない
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    // ⚠️ パスワード変更の要求なしでログイン成功
    const user = result.rows[0];
    return c.json({
      success: true,
      message: `${user.username} としてログインしました（role: ${user.role}）`,
      user,
      _debug: {
        message: "デフォルトパスワードでログインが成功しました。パスワード変更は要求されません。",
      },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ success: false, message: "エラーが発生しました", error: error.message }, 500);
  }
});

// ⚠️ デフォルト認証情報リストの表示（学習用）
app.get("/defaults", (c) => {
  return c.json({
    message: "攻撃者が公開情報から入手できるデフォルト認証情報のリスト",
    credentials: DEFAULT_CREDENTIALS,
    _debug: {
      hint: "これらのパスワードを脆弱版のログインで試してみてください。",
    },
  });
});

export default app;
