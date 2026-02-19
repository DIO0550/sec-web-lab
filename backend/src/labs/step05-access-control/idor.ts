import { Hono } from "hono";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: IDOR (Insecure Direct Object Reference)
// IDを書き換えるだけで他人のデータが見える
// ========================================

// インメモリセッション管理（デモ用）
const sessions = new Map<string, { id: number; username: string; role: string }>();

// セッションIDの生成（デモ用の簡易実装）
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
      message: `${user.username} としてログインしました`,
      sessionId,
      user: { id: user.id, username: user.username },
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
      message: `${user.username} としてログインしました`,
      sessionId,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// --- 脆弱バージョン ---

// ⚠️ プロフィール取得: パスパラメータのIDをそのまま信頼し、認可チェックなし
// 攻撃者はIDを書き換えるだけで他ユーザーのプロフィールを取得できる
app.get("/vulnerable/users/:id/profile", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;
  const targetId = c.req.param("id");
  const pool = getPool();

  try {
    // ⚠️ パスパラメータのIDをそのままクエリに使用
    // currentUser.id と targetId の照合を行っていない
    // → ログイン済みであれば誰のIDでも指定できてしまう
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [targetId]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
    }

    return c.json({
      success: true,
      profile: result.rows[0],
      _debug: {
        message: "認可チェックなし: リクエスト元のユーザーIDとリソースIDの照合を行っていません",
        currentUserId: currentUser.id,
        requestedId: Number(targetId),
      },
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// ⚠️ 投稿取得: 他ユーザーの投稿もIDを指定するだけで取得できる
app.get("/vulnerable/users/:id/posts", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;
  const targetId = c.req.param("id");
  const pool = getPool();

  try {
    // ⚠️ 認可チェックなし — 任意のユーザーの投稿を取得できる
    const result = await pool.query(
      "SELECT id, title, content, created_at FROM posts WHERE user_id = $1",
      [targetId]
    );

    return c.json({
      success: true,
      posts: result.rows,
      _debug: {
        message: "認可チェックなし: 他ユーザーの投稿データにもアクセス可能",
        currentUserId: currentUser.id,
        requestedUserId: Number(targetId),
      },
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// --- 安全バージョン ---

// ✅ プロフィール取得: セッションのユーザーIDとリクエストされたIDを照合
app.get("/secure/users/:id/profile", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;
  const targetId = Number(c.req.param("id"));
  const pool = getPool();

  // ✅ 認可チェック: セッションのユーザーIDとリクエストされたIDを照合
  // 自分以外のプロフィールへのアクセスを拒否する
  if (currentUser.id !== targetId) {
    return c.json({
      success: false,
      message: "アクセス権限がありません",
      _debug: {
        message: "認可チェック: セッションのユーザーID とリクエストされたIDが一致しません",
        currentUserId: currentUser.id,
        requestedId: targetId,
      },
    }, 403);
  }

  try {
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [targetId]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
    }

    return c.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// ✅ 投稿取得: 自分の投稿のみ取得可能
app.get("/secure/users/:id/posts", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const currentUser = sessions.get(sessionId)!;
  const targetId = Number(c.req.param("id"));
  const pool = getPool();

  // ✅ 認可チェック: 自分の投稿のみ取得可能
  if (currentUser.id !== targetId) {
    return c.json({
      success: false,
      message: "アクセス権限がありません",
    }, 403);
  }

  try {
    const result = await pool.query(
      "SELECT id, title, content, created_at FROM posts WHERE user_id = $1",
      [targetId]
    );

    return c.json({
      success: true,
      posts: result.rows,
    });
  } catch (err) {
    return c.json({ success: false, message: "エラーが発生しました" }, 500);
  }
});

// セッションリセット（デモ用）
app.post("/reset", (c) => {
  sessions.clear();
  return c.json({ message: "セッションをリセットしました" });
});

export default app;
