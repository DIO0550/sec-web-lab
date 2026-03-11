import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";
import { sessions, authenticate } from "./shared.js";

const app = new Hono();

// ========================================
// Lab: Session Fixation
// 攻撃者が仕込んだセッションIDで被害者をログインさせる
// --- 安全バージョン ---
// ========================================

// ✅ ログイン: セッションIDを再生成し、古いIDを無効化
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
    // ✅ セッションIDはレスポンスに含めない
  });
});

// ✅ ログアウト
app.post("/logout", (c) => {
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

export default app;
