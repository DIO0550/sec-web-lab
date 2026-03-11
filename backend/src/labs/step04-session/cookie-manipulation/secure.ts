import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";
import { sessions } from "./shared.js";

const app = new Hono();

// ========================================
// Lab: Cookie Security Misconfiguration
// Cookie属性の不備が招く複数の攻撃経路
// --- 安全バージョン ---
// ========================================

// ✅ ログイン: 全セキュリティ属性を設定して Cookie を発行
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  const validUsers: Record<string, string> = {
    alice: "alice123",
    admin: "admin123",
    user1: "password1",
  };

  if (validUsers[username] !== password) {
    return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
  }

  const sessionId = randomBytes(16).toString("hex");
  sessions.set(sessionId, { userId: 1, username });

  // ✅ 全セキュリティ属性を設定 — 3つの攻撃経路をすべて遮断
  setCookie(c, "session_id", sessionId, {
    path: "/",
    httpOnly: true,   // ✅ XSS による Cookie 窃取を防止
    secure: true,     // ✅ HTTP 平文通信での Cookie 漏洩を防止
    sameSite: "Strict", // ✅ CSRF 攻撃での Cookie 自動送信を防止
  });

  return c.json({
    success: true,
    message: `${username} としてログインしました（安全版）`,
    // ✅ セッションIDはレスポンスに含めない（HttpOnlyなので不要）
    cookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    },
  });
});

// ✅ Cookie の属性を確認するエンドポイント
app.get("/cookie-info", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "セッションがありません" }, 401);
  }
  const session = sessions.get(sessionId)!;
  return c.json({
    success: true,
    username: session.username,
    // ✅ セッションIDはレスポンスに含めない
    protections: [
      "HttpOnly: document.cookie からアクセス不可",
      "Secure: HTTPS 通信時のみ Cookie を送信",
      "SameSite=Strict: クロスサイトリクエストで Cookie を送信しない",
    ],
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
