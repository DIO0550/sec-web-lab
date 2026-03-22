import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ハードコードされたユーザーデータベース（デモ用）
const users: Record<string, { password: string; email: string }> = {
  admin: { password: "password123", email: "admin@example.com" },
  alice: { password: "password123", email: "alice@example.com" },
  bob: { password: "password123", email: "bob@example.com" },
};

// ⚠️ ログイン: ユーザーの存在有無で異なるエラーメッセージを返す
// さらに、存在するユーザーの場合のみ遅延が発生し、タイミング攻撃が可能
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (!username || !password) {
    return c.json(
      { error: "ユーザー名とパスワードを入力してください" },
      400
    );
  }

  const user = users[username];

  if (!user) {
    // ⚠️ ユーザーが存在しない場合、即座に異なるメッセージを返す
    // 攻撃者はこのメッセージからユーザー名の存在を判別できる
    return c.json({ error: "ユーザーが見つかりません" }, 401);
  }

  // ⚠️ 存在するユーザーへのDB検索を模した意図的な遅延（50ms）
  // タイミング攻撃でユーザーの存在を推測できる
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (user.password !== password) {
    // ⚠️ パスワード不一致の場合、別のメッセージを返す
    // 「パスワードが違います」=「ユーザー名は正しい」と攻撃者に教えてしまう
    return c.json({ error: "パスワードが違います" }, 401);
  }

  return c.json({
    message: `${username} としてログインしました`,
    user: { username, email: user.email },
  });
});

export default app;
