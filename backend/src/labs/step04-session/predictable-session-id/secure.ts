import { Hono } from "hono";
import { randomUUID } from "node:crypto";

const app = new Hono();

// --- 安全バージョン ---

// ✅ メモリ上のセッションストア
const sessions = new Map<string, { username: string; email: string }>();

// ユーザーデータベース（デモ用）
const users: Record<string, { password: string; email: string }> = {
  admin: { password: "password123", email: "admin@example.com" },
  alice: { password: "password123", email: "alice@example.com" },
  bob: { password: "password123", email: "bob@example.com" },
};

// ✅ ログイン: セッションIDをcrypto.randomUUID()で生成
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ error: "ユーザー名とパスワードを入力してください" }, 400);
  }

  const user = users[username];
  if (!user || user.password !== password) {
    return c.json({ error: "認証に失敗しました" }, 401);
  }

  // ✅ 暗号論的に安全な乱数でセッションIDを生成
  // 2^122通りの可能性があり、推測は計算上不可能
  const sessionId = randomUUID();

  sessions.set(sessionId, { username, email: user.email });

  return c.json({
    message: `${username} としてログインしました`,
    sessionId,
  });
});

// ✅ プロフィール: X-Session-Id ヘッダーで認証
app.get("/profile", (c) => {
  const sessionId = c.req.header("X-Session-Id");

  if (!sessionId) {
    return c.json({ error: "セッションIDが必要です" }, 401);
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return c.json({ error: "無効なセッションIDです" }, 401);
  }

  return c.json({
    username: session.username,
    email: session.email,
  });
});

export default app;
