import { Hono } from "hono";
import { randomUUID } from "node:crypto";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ セッションストア — 有効期限なし
const sessions = new Map<
  string,
  { username: string; email: string; createdAt: number }
>();

// ユーザーデータベース（デモ用）
const users: Record<string, { password: string; email: string }> = {
  admin: { password: "password123", email: "admin@example.com" },
  alice: { password: "password123", email: "alice@example.com" },
  bob: { password: "password123", email: "bob@example.com" },
};

// ⚠️ ログイン: トークンに有効期限を設定しない
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

  const token = randomUUID();

  // ⚠️ セッションに有効期限を設定しない — 永久に有効
  sessions.set(token, {
    username,
    email: user.email,
    createdAt: Date.now(),
  });

  return c.json({
    message: `${username} としてログインしました`,
    token,
  });
});

// ⚠️ プロフィール: 有効期限チェックなし — 古いトークンでもアクセス可能
app.get("/profile", (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return c.json({ error: "トークンが必要です" }, 401);
  }

  const session = sessions.get(token);
  if (!session) {
    return c.json({ error: "無効なトークンです" }, 401);
  }

  // ⚠️ 有効期限のチェックがない — 何時間・何日経過しても有効
  return c.json({
    username: session.username,
    email: session.email,
    createdAt: session.createdAt,
    message: "プロフィール取得成功（有効期限チェックなし）",
  });
});

export default app;
