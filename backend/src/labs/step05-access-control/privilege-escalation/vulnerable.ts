import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";
import { sessions, systemSettings, updateSystemSettings, generateSessionId } from "./shared.js";

const app = new Hono();

// --- 共通: ログイン ---

app.post("/login", async (c) => {
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
    const sessionId = generateSessionId();
    sessions.set(sessionId, { id: user.id, username: user.username, role: user.role });

    return c.json({
      success: true,
      message: `${user.username} としてログインしました（role: ${user.role}）`,
      sessionId,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// --- 脆弱バージョン ---

// ⚠️ 管理者用ユーザー一覧: 認証のみでロールの検証がない
// 一般ユーザーでも管理者APIにアクセスできてしまう
app.get("/admin/users", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;
  const pool = getPool();

  try {
    // ⚠️ ログイン済みであれば誰でも全ユーザー一覧を取得できる
    // currentUser.role === 'admin' の検証がない
    const result = await pool.query("SELECT id, username, email, role, created_at FROM users");

    return c.json({
      success: true,
      users: result.rows,
      _debug: {
        message: "ロール検証なし: ログイン済みであれば誰でも管理者APIにアクセス可能",
        currentUser: { id: currentUser.id, username: currentUser.username, role: currentUser.role },
      },
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// ⚠️ 管理者用設定変更: ロール検証なし
app.put("/admin/settings", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;
  const body = await c.req.json();

  // ⚠️ ロール検証なし — 一般ユーザーでもシステム設定を変更できる
  updateSystemSettings(body);

  return c.json({
    success: true,
    message: "設定を更新しました",
    settings: systemSettings,
    _debug: {
      message: "ロール検証なし: 一般ユーザーでもシステム設定を変更できてしまいます",
      currentUser: { id: currentUser.id, username: currentUser.username, role: currentUser.role },
    },
  });
});

// ⚠️ 管理者用設定取得: ロール検証なし
app.get("/admin/settings", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;

  return c.json({
    success: true,
    settings: systemSettings,
    _debug: {
      currentUser: { id: currentUser.id, username: currentUser.username, role: currentUser.role },
    },
  });
});

export default app;
