import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ セッションIDに連番を使用 — 予測可能で他人のセッションを推測できる
let counter = 1000;

// ⚠️ メモリ上のセッションストア
const sessions = new Map<string, { username: string; email: string }>();

// ユーザーデータベース（デモ用）
const users: Record<string, { password: string; email: string }> = {
  admin: { password: "password123", email: "admin@example.com" },
  alice: { password: "password123", email: "alice@example.com" },
  bob: { password: "password123", email: "bob@example.com" },
};

// ⚠️ ログイン: セッションIDを連番で生成
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

  // ⚠️ 連番でセッションIDを生成 — 次のIDが容易に推測できる
  counter++;
  const sessionId = String(counter);

  sessions.set(sessionId, { username, email: user.email });

  return c.json({
    message: `${username} としてログインしました`,
    sessionId,
  });
});

// ⚠️ プロフィール: X-Session-Id ヘッダーで認証
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
