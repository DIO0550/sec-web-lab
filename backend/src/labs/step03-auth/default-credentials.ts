import { Hono } from "hono";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: Default Credentials
// 初期パスワードのまま運用されたシステムに侵入する
// ========================================

// デフォルト認証情報のリスト（攻撃者が公開情報から入手できるもの）
const DEFAULT_CREDENTIALS = [
  { username: "admin", password: "admin123", source: "GitHub リポジトリの seed.ts" },
  { username: "admin", password: "admin", source: "一般的なデフォルト" },
  { username: "admin", password: "password", source: "一般的なデフォルト" },
  { username: "root", password: "root", source: "一般的なデフォルト" },
  { username: "admin", password: "1234", source: "一般的なデフォルト" },
];

// --- 脆弱バージョン ---

// ⚠️ ログイン: デフォルトパスワードでもそのままログインが完了する
app.post("/vulnerable/login", async (c) => {
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
app.get("/vulnerable/defaults", (c) => {
  return c.json({
    message: "攻撃者が公開情報から入手できるデフォルト認証情報のリスト",
    credentials: DEFAULT_CREDENTIALS,
    _debug: {
      hint: "これらのパスワードを脆弱版のログインで試してみてください。",
    },
  });
});

// --- 安全バージョン ---

// パスワード変更済みユーザーの追跡（デモ用。実際はDBに must_change_password カラムを使用）
const passwordChanged = new Set<string>();

// デフォルトパスワードとして定義されたもの
const DEFAULT_PASSWORDS: Record<string, string> = {
  admin: "admin123",
};

// ✅ ログイン: デフォルトパスワードの場合はパスワード変更を強制
app.post("/secure/login", async (c) => {
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

    const user = result.rows[0];

    // ✅ デフォルトパスワードかどうかをチェック
    const isDefault = DEFAULT_PASSWORDS[username] === password;
    const alreadyChanged = passwordChanged.has(username);

    if (isDefault && !alreadyChanged) {
      // ✅ デフォルトパスワードの場合はログインを拒否し、パスワード変更を要求
      return c.json({
        success: false,
        message: "デフォルトパスワードでのログインは許可されません。パスワードを変更してください。",
        requirePasswordChange: true,
        user: { id: user.id, username: user.username },
      }, 403);
    }

    return c.json({
      success: true,
      message: `${user.username} としてログインしました（role: ${user.role}）`,
      user,
    });
  } catch (err) {
    console.error("Login error:", (err as Error).message);
    return c.json({ success: false, message: "処理中にエラーが発生しました" }, 500);
  }
});

// ✅ パスワード変更エンドポイント
app.post("/secure/change-password", async (c) => {
  const body = await c.req.json<{ username: string; currentPassword: string; newPassword: string }>();
  const { username, currentPassword, newPassword } = body;
  const pool = getPool();

  if (!username || !currentPassword || !newPassword) {
    return c.json({ success: false, message: "すべてのフィールドを入力してください" }, 400);
  }

  if (newPassword.length < 8) {
    return c.json({ success: false, message: "新しいパスワードは8文字以上にしてください" }, 400);
  }

  if (currentPassword === newPassword) {
    return c.json({ success: false, message: "現在のパスワードと異なるパスワードを設定してください" }, 400);
  }

  try {
    // 現在のパスワードが正しいか確認
    const result = await pool.query(
      "SELECT id, username FROM users WHERE username = $1 AND password = $2",
      [username, currentPassword]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "現在のパスワードが正しくありません" }, 401);
    }

    // パスワード変更済みとして記録（デモ用）
    passwordChanged.add(username);

    return c.json({
      success: true,
      message: "パスワードが変更されました。新しいパスワードでログインしてください。",
    });
  } catch (err) {
    console.error("Password change error:", (err as Error).message);
    return c.json({ success: false, message: "処理中にエラーが発生しました" }, 500);
  }
});

// ✅ 状態リセット（デモ用）
app.post("/secure/reset", (c) => {
  passwordChanged.clear();
  return c.json({ message: "デモ状態がリセットされました" });
});

export default app;
