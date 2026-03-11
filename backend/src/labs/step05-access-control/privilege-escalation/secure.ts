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

// --- 安全バージョン ---

// ✅ 管理者用ユーザー一覧: ミドルウェアパターンでロールを検証
app.get("/admin/users", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;

  // ✅ ロール検証: admin ロールを持つユーザーのみアクセス可能
  if (currentUser.role !== "admin") {
    return c.json({
      success: false,
      message: "管理者権限が必要です",
      _debug: {
        message: "ロール検証: 一般ユーザーのアクセスを拒否しました",
        currentUser: { id: currentUser.id, username: currentUser.username, role: currentUser.role },
        requiredRole: "admin",
      },
    }, 403);
  }

  const pool = getPool();

  try {
    const result = await pool.query("SELECT id, username, email, role, created_at FROM users");

    return c.json({
      success: true,
      users: result.rows,
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// ✅ 管理者用設定変更: ロール検証あり
app.put("/admin/settings", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;

  // ✅ ロール検証: admin のみ設定変更可能
  if (currentUser.role !== "admin") {
    return c.json({
      success: false,
      message: "管理者権限が必要です",
      _debug: {
        message: "ロール検証: 一般ユーザーによる設定変更を拒否しました",
        currentUser: { id: currentUser.id, username: currentUser.username, role: currentUser.role },
      },
    }, 403);
  }

  const body = await c.req.json();
  updateSystemSettings(body);

  return c.json({
    success: true,
    message: "設定を更新しました",
    settings: systemSettings,
  });
});

// ✅ 管理者用設定取得: ロール検証あり
app.get("/admin/settings", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;

  if (currentUser.role !== "admin") {
    return c.json({
      success: false,
      message: "管理者権限が必要です",
    }, 403);
  }

  return c.json({
    success: true,
    settings: systemSettings,
  });
});

export default app;
