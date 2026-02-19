import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";

const app = new Hono();

// ========================================
// Lab: Session Hijacking
// XSSで盗んだセッションIDで他人になりすます
// ========================================

// インメモリセッションストア（学習目的）
const sessions = new Map<string, { userId: number; username: string }>();

// インメモリコメントストア（Stored XSS 用）
type Comment = { id: number; username: string; content: string; createdAt: string };
let vulnComments: Comment[] = [];
let secureComments: Comment[] = [];
let commentIdCounter = 1;

// --- 脆弱バージョン ---

// ⚠️ ログイン: HttpOnly なしで Cookie を発行
app.post("/vulnerable/login", async (c) => {
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

  // ⚠️ HttpOnly が設定されていない — JavaScript から Cookie にアクセス可能
  setCookie(c, "session_id", sessionId, {
    path: "/",
    // httpOnly: true が設定されていない
    // → JavaScript の document.cookie からアクセス可能
  });

  return c.json({
    success: true,
    message: `${username} としてログインしました`,
    sessionId,
  });
});

// ⚠️ コメント投稿: XSS ペイロードをそのまま保存
app.post("/vulnerable/comment", async (c) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインしてください" }, 401);
  }

  const session = sessions.get(sessionId)!;
  const body = await c.req.json<{ content: string }>();

  if (!body.content) {
    return c.json({ success: false, message: "コメントを入力してください" }, 400);
  }

  // ⚠️ コメント内容をサニタイズせずそのまま保存 — Stored XSS が可能
  const comment: Comment = {
    id: commentIdCounter++,
    username: session.username,
    content: body.content,
    createdAt: new Date().toISOString(),
  };
  vulnComments.push(comment);

  return c.json({ success: true, message: "コメントを投稿しました", comment });
});

// ⚠️ コメント一覧: サニタイズなしで返す（フロントエンドで innerHTML 等で表示すると XSS 発動）
app.get("/vulnerable/comments", (c) => {
  return c.json({ success: true, comments: vulnComments });
});

// ⚠️ プロフィール: セッションIDで認証
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
    warning: "HttpOnly なしのため、document.cookie でセッションIDが読み取り可能",
  });
});

// --- 安全バージョン ---

// ✅ ログイン: HttpOnly 属性を設定して Cookie を発行
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

  // ✅ HttpOnly 属性を設定 — JavaScript からCookieにアクセスできなくなる
  setCookie(c, "session_id", sessionId, {
    path: "/",
    httpOnly: true,     // ✅ JavaScript の document.cookie からアクセス不可
    secure: true,       // ✅ HTTPS 通信時のみ送信
    sameSite: "Strict", // ✅ クロスサイトリクエストで送信しない
  });

  return c.json({
    success: true,
    message: `${username} としてログインしました（安全版）`,
    // ✅ セッションIDはレスポンスに含めない
  });
});

// ✅ コメント投稿: HTMLエスケープして保存
app.post("/secure/comment", async (c) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ success: false, message: "ログインしてください" }, 401);
  }

  const session = sessions.get(sessionId)!;
  const body = await c.req.json<{ content: string }>();

  if (!body.content) {
    return c.json({ success: false, message: "コメントを入力してください" }, 400);
  }

  // ✅ コメント内容をHTMLエスケープしてから保存 — XSS を防止
  const escaped = body.content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const comment: Comment = {
    id: commentIdCounter++,
    username: session.username,
    content: escaped,
    createdAt: new Date().toISOString(),
  };
  secureComments.push(comment);

  return c.json({ success: true, message: "コメントを投稿しました", comment });
});

// ✅ コメント一覧
app.get("/secure/comments", (c) => {
  return c.json({ success: true, comments: secureComments });
});

// ✅ プロフィール: セッションIDで認証
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
    info: "HttpOnly により document.cookie からセッションIDは読み取れません",
  });
});

// デモ用: コメントリセット
app.post("/reset", (c) => {
  vulnComments = [];
  secureComments = [];
  sessions.clear();
  return c.json({ success: true, message: "コメントとセッションをリセットしました" });
});

export default app;
