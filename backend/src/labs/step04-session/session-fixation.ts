import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";

const app = new Hono();

// ========================================
// Lab: Session Fixation
// 攻撃者が仕込んだセッションIDで被害者をログインさせる
// ========================================

// インメモリセッションストア（学習目的）
const sessions = new Map<string, { userId: number; username: string }>();

// デモ用の簡易認証
function authenticate(username: string, password: string): { id: number; username: string } | null {
  const validUsers: Record<string, { id: number; password: string }> = {
    alice: { id: 1, password: "alice123" },
    admin: { id: 2, password: "admin123" },
    user1: { id: 3, password: "password1" },
  };
  const user = validUsers[username];
  if (!user || user.password !== password) return null;
  return { id: user.id, username };
}

// --- 脆弱バージョン ---

// ⚠️ セッション設定: 外部からのセッションID指定を受け入れる
app.post("/vulnerable/set-session", async (c) => {
  const body = await c.req.json<{ sessionId: string }>();
  const { sessionId } = body;

  if (!sessionId) {
    return c.json({ success: false, message: "セッションIDを指定してください" }, 400);
  }

  // ⚠️ 外部から指定されたセッションIDをそのまま受け入れる
  setCookie(c, "session_id", sessionId, { path: "/" });

  return c.json({
    success: true,
    message: `セッションID "${sessionId}" を設定しました`,
    sessionId,
  });
});

// ⚠️ ログイン: セッションIDを再生成しない
app.post("/vulnerable/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  const user = authenticate(username, password);
  if (!user) {
    return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
  }

  // ⚠️ 既存のセッションIDをそのまま使用 — 再生成しない
  // → 攻撃者が事前に設定したセッションIDが認証済みになってしまう
  let sessionId = getCookie(c, "session_id");
  if (!sessionId) {
    sessionId = randomBytes(16).toString("hex");
    setCookie(c, "session_id", sessionId, { path: "/" });
  }

  sessions.set(sessionId, { userId: user.id, username: user.username });

  return c.json({
    success: true,
    message: `${user.username} としてログインしました`,
    sessionId,
    warning: "セッションIDはログイン前と同じ値が使用されています",
  });
});

// ⚠️ プロフィール取得
app.get("/vulnerable/profile", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "セッションがありません" }, 401);
  }
  const session = sessions.get(sessionId)!;
  return c.json({
    success: true,
    username: session.username,
    userId: session.userId,
    sessionId,
  });
});

// ⚠️ ログアウト
app.post("/vulnerable/logout", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) sessions.delete(sessionId);
  setCookie(c, "session_id", "", { path: "/", maxAge: 0 });
  return c.json({ success: true, message: "ログアウトしました" });
});

// --- 安全バージョン ---

// ✅ ログイン: セッションIDを再生成し、古いIDを無効化
app.post("/secure/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  const user = authenticate(username, password);
  if (!user) {
    return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
  }

  // ✅ 古いセッションIDを無効化
  const oldSessionId = getCookie(c, "session_id");
  if (oldSessionId) {
    sessions.delete(oldSessionId);
  }

  // ✅ 新しいセッションIDを生成して認証情報を紐づけ
  const newSessionId = randomBytes(32).toString("hex");
  sessions.set(newSessionId, { userId: user.id, username: user.username });

  // ✅ 全セキュリティ属性を設定
  setCookie(c, "session_id", newSessionId, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  return c.json({
    success: true,
    message: `${user.username} としてログインしました（安全版）`,
    info: "新しいセッションIDが生成され、古いIDは無効化されました",
  });
});

// ✅ プロフィール取得
app.get("/secure/profile", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "セッションがありません" }, 401);
  }
  const session = sessions.get(sessionId)!;
  return c.json({
    success: true,
    username: session.username,
    userId: session.userId,
    // ✅ セッションIDはレスポンスに含めない
  });
});

// ✅ ログアウト
app.post("/secure/logout", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) sessions.delete(sessionId);
  setCookie(c, "session_id", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 0,
  });
  return c.json({ success: true, message: "ログアウトしました" });
});

// デモ用: セッションリセット
app.post("/reset", (c) => {
  sessions.clear();
  return c.json({ success: true, message: "全セッションをリセットしました" });
});

export default app;
