import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";
import { sessions } from "./shared.js";

const app = new Hono();

// ========================================
// Lab: Cross-Site Request Forgery (CSRF)
// 被害者のブラウザを使って勝手にリクエストを送る
// --- 脆弱バージョン ---
// ========================================

// ⚠️ ログイン: CSRF 対策なし
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  const validUsers: Record<string, { id: number; password: string; email: string }> = {
    alice: { id: 1, password: "alice123", email: "alice@example.com" },
    admin: { id: 2, password: "admin123", email: "admin@example.com" },
    user1: { id: 3, password: "password1", email: "user1@example.com" },
  };

  const user = validUsers[username];
  if (!user || user.password !== password) {
    return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
  }

  const sessionId = randomBytes(16).toString("hex");
  sessions.set(sessionId, {
    userId: user.id,
    username,
    password: user.password,
    email: user.email,
  });

  // ⚠️ SameSite 属性なし — クロスサイトリクエストにも Cookie が送信される
  setCookie(c, "session_id", sessionId, {
    path: "/",
  });

  return c.json({
    success: true,
    message: `${username} としてログインしました`,
    sessionId,
  });
});

// ⚠️ パスワード変更: CSRF トークンを検証しない
app.post("/change-password", async (c) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインしてください" }, 401);
  }

  const session = sessions.get(sessionId)!;
  const body = await c.req.json<{ newPassword: string }>();

  if (!body.newPassword) {
    return c.json({ success: false, message: "新しいパスワードを入力してください" }, 400);
  }

  // ⚠️ Cookie が正しければ無条件にパスワードを変更してしまう
  // → 外部サイトからのリクエストでも Cookie は自動送信されるため、
  //   攻撃者のサイトからでも「正規のリクエスト」と区別できない
  session.password = body.newPassword;

  return c.json({
    success: true,
    message: `パスワードを変更しました（新パスワード: ${body.newPassword}）`,
    username: session.username,
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
    email: session.email,
    currentPassword: session.password,
  });
});

export default app;
