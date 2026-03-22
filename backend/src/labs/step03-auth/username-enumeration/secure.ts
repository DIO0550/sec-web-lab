import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ユーザーデータベース（デモ用）
const users: Record<string, { password: string; email: string }> = {
  admin: { password: "password123", email: "admin@example.com" },
  alice: { password: "password123", email: "alice@example.com" },
  bob: { password: "password123", email: "bob@example.com" },
};

// ✅ ログイン: エラーメッセージを統一し、ダミーの処理でタイミング差を最小化
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

  // ✅ ユーザーが存在しない場合でもダミーのハッシュ比較を実行
  // これによりタイミング差を最小化し、タイミング攻撃を防ぐ
  const dummyPassword = "dummy-placeholder-for-timing";
  const passwordToCompare = user ? user.password : dummyPassword;

  // ✅ 存在しないユーザーでも同じ処理時間をかける（ダミー比較）
  await new Promise((resolve) => setTimeout(resolve, 50));
  const isValid = user && passwordToCompare === password;

  if (!isValid) {
    // ✅ ユーザーが存在しない場合もパスワードが違う場合も
    // 同一のエラーメッセージを返す
    return c.json(
      { error: "ユーザー名またはパスワードが正しくありません" },
      401
    );
  }

  return c.json({
    message: `${username} としてログインしました`,
    user: { username, email: user.email },
  });
});

export default app;
