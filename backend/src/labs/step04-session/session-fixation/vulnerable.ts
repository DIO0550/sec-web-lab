import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";
import { sessions, authenticate } from "./shared.js";

const app = new Hono();

// ========================================
// Lab: Session Fixation
// 攻撃者が仕込んだセッションIDで被害者をログインさせる
// --- 脆弱バージョン ---
// ========================================

// ⚠️ セッション設定: 外部からのセッションID指定を受け入れる
app.post("/set-session", async (c) => {
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
app.post("/login", async (c) => {
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
app.get("/profile", (c) => {
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
app.post("/logout", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) sessions.delete(sessionId);
  setCookie(c, "session_id", "", { path: "/", maxAge: 0 });
  return c.json({ success: true, message: "ログアウトしました" });
});

export default app;
