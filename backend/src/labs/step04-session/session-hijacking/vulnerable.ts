import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { randomBytes } from "crypto";
import { sessions, vulnComments, getNextCommentId } from "./shared.js";
import type { Comment } from "./shared.js";

const app = new Hono();

// ========================================
// Lab: Session Hijacking
// XSSで盗んだセッションIDで他人になりすます
// --- 脆弱バージョン ---
// ========================================

// ⚠️ ログイン: HttpOnly なしで Cookie を発行
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
app.post("/comment", async (c) => {
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
    id: getNextCommentId(),
    username: session.username,
    content: body.content,
    createdAt: new Date().toISOString(),
  };
  vulnComments.push(comment);

  return c.json({ success: true, message: "コメントを投稿しました", comment });
});

// ⚠️ コメント一覧: サニタイズなしで返す（フロントエンドで innerHTML 等で表示すると XSS 発動）
app.get("/comments", (c) => {
  return c.json({ success: true, comments: vulnComments });
});

// ⚠️ プロフィール: セッションIDで認証
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
    warning: "HttpOnly なしのため、document.cookie でセッションIDが読み取り可能",
  });
});

export default app;
