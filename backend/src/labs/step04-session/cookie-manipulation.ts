import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";

const app = new Hono();

// ========================================
// Lab: Cookie Security Misconfiguration
// Cookie属性の不備が招く複数の攻撃経路
// ========================================

// インメモリセッションストア（学習目的）
const sessions = new Map<string, { userId: number; username: string }>();

// --- 脆弱バージョン ---

// ⚠️ ログイン: セキュリティ属性なしで Cookie を発行
app.post("/vulnerable/login", async (c) => {
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
app.get("/vulnerable/cookie-info", (c) => {
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
app.post("/vulnerable/logout", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) sessions.delete(sessionId);
  setCookie(c, "session_id", "", { path: "/", maxAge: 0 });
  return c.json({ success: true, message: "ログアウトしました" });
});

// --- 安全バージョン ---

// ✅ ログイン: 全セキュリティ属性を設定して Cookie を発行
app.post("/secure/login", async (c) => {
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
app.get("/secure/cookie-info", (c) => {
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

export default app;
