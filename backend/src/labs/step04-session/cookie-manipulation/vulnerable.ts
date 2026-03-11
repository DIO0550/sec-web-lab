import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";
import { sessions } from "./shared.js";

const app = new Hono();

// ========================================
// Lab: Cookie Security Misconfiguration
// Cookie属性の不備が招く複数の攻撃経路
// --- 脆弱バージョン ---
// ========================================

// ⚠️ ログイン: セキュリティ属性なしで Cookie を発行
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  // デモ用の簡易認証
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

  // ⚠️ セキュリティ属性が一切設定されていない
  // httpOnly なし → document.cookie でアクセス可能（XSS で窃取される）
  // secure なし → HTTP 平文通信で Cookie が送信される（傍受される）
  // sameSite なし → 外部サイトからのリクエストにも Cookie が付く（CSRF に利用される）
  setCookie(c, "session_id", sessionId, {
    path: "/",
  });

  return c.json({
    success: true,
    message: `${username} としてログインしました`,
    sessionId,
    cookieAttributes: {
      httpOnly: false,
      secure: false,
      sameSite: "none (未設定)",
    },
  });
});

// ⚠️ Cookie の属性を確認するエンドポイント
app.get("/cookie-info", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "セッションがありません" }, 401);
  }
  const session = sessions.get(sessionId)!;
  return c.json({
    success: true,
    username: session.username,
    sessionId,
    // ⚠️ Cookie 属性情報を返す（学習用）
    vulnerabilities: [
      "HttpOnly なし: document.cookie で読み取り可能",
      "Secure なし: HTTP 平文通信で Cookie が送信される",
      "SameSite なし: 外部サイトからのリクエストにも Cookie が付与される",
    ],
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
