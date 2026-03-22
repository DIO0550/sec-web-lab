import { Hono } from "hono";
import { randomUUID } from "node:crypto";

const app = new Hono();

// --- 安全バージョン ---

// トークンストア
const tokens = new Map<string, { username: string; email: string }>();

// ✅ トークンブラックリスト（ログアウト済みトークンを記録）
// 本番環境では Redis 等の外部ストアを使用する
const blacklist = new Set<string>();

// ユーザーデータベース（デモ用）
const users: Record<string, { password: string; email: string }> = {
  admin: { password: "password123", email: "admin@example.com" },
  alice: { password: "password123", email: "alice@example.com" },
  bob: { password: "password123", email: "bob@example.com" },
};

// ログイン: トークンを発行
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
  tokens.set(token, { username, email: user.email });

  return c.json({
    message: `${username} としてログインしました`,
    token,
  });
});

// ✅ ログアウト: トークンをブラックリストに追加して無効化
app.post("/logout", (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    // ✅ トークンをブラックリストに登録 — サーバー側で失効を管理
    blacklist.add(token);
  }

  return c.json({ message: "ログアウトしました" });
});

// ✅ プロフィール: ブラックリストのチェックを行い、ログアウト済みトークンを拒否
app.get("/profile", (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return c.json({ error: "トークンが必要です" }, 401);
  }

  // ✅ ブラックリストに含まれるトークンを拒否
  if (blacklist.has(token)) {
    return c.json({ error: "トークンは無効化されています" }, 401);
  }

  const session = tokens.get(token);
  if (!session) {
    return c.json({ error: "無効なトークンです" }, 401);
  }

  return c.json({
    username: session.username,
    email: session.email,
  });
});

export default app;
