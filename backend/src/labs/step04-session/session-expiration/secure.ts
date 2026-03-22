import { Hono } from "hono";
import { randomUUID } from "node:crypto";

const app = new Hono();

// --- 安全バージョン ---

// ✅ セッションの有効期限: 10秒（デモ用、本番では30分〜8時間）
const SESSION_TIMEOUT_MS = 10 * 1000;

// ✅ セッションストア — 有効期限付き
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

// ✅ ログイン: トークンに有効期限を設定
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

  // ✅ セッションに作成時刻を記録（有効期限チェックの基準）
  sessions.set(token, {
    username,
    email: user.email,
    createdAt: Date.now(),
  });

  return c.json({
    message: `${username} としてログインしました（有効期限: ${SESSION_TIMEOUT_MS / 1000}秒）`,
    token,
    expiresInSeconds: SESSION_TIMEOUT_MS / 1000,
  });
});

// ✅ プロフィール: 有効期限をチェックし、期限切れなら拒否
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

  // ✅ 有効期限チェック — 作成時刻からの経過時間を検証
  const elapsed = Date.now() - session.createdAt;
  if (elapsed > SESSION_TIMEOUT_MS) {
    // ✅ 期限切れのセッションを削除し、エラーを返す
    sessions.delete(token);
    return c.json({ error: "セッションの有効期限が切れました" }, 401);
  }

  return c.json({
    username: session.username,
    email: session.email,
    createdAt: session.createdAt,
    remainingSeconds: Math.ceil((SESSION_TIMEOUT_MS - elapsed) / 1000),
    message: "プロフィール取得成功（有効期限チェック済み）",
  });
});

export default app;
