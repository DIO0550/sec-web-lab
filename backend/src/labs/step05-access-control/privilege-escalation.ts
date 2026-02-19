import { Hono } from "hono";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: Privilege Escalation
// 一般ユーザーが管理者の操作を実行する
// ========================================

// インメモリセッション管理（デモ用）
const sessions = new Map<string, { id: number; username: string; role: string }>();

// システム設定（デモ用）
let systemSettings = {
  maintenance_mode: false,
  allow_registration: true,
  max_upload_size: "10MB",
};

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// --- 共通: ログイン ---

app.post("/vulnerable/login", async (c) => {
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
app.get("/vulnerable/admin/users", async (c) => {
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
app.put("/vulnerable/admin/settings", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;
  const body = await c.req.json();

  // ⚠️ ロール検証なし — 一般ユーザーでもシステム設定を変更できる
  systemSettings = { ...systemSettings, ...body };

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
app.get("/vulnerable/admin/settings", async (c) => {
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

// --- 安全バージョン ---

// ✅ 管理者用ユーザー一覧: ミドルウェアパターンでロールを検証
app.get("/secure/admin/users", async (c) => {
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
app.put("/secure/admin/settings", async (c) => {
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
  systemSettings = { ...systemSettings, ...body };

  return c.json({
    success: true,
    message: "設定を更新しました",
    settings: systemSettings,
  });
});

// ✅ 管理者用設定取得: ロール検証あり
app.get("/secure/admin/settings", async (c) => {
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

// セッション・設定リセット（デモ用）
app.post("/reset", (c) => {
  sessions.clear();
  systemSettings = {
    maintenance_mode: false,
    allow_registration: true,
    max_upload_size: "10MB",
  };
  return c.json({ message: "セッションと設定をリセットしました" });
});

export default app;
