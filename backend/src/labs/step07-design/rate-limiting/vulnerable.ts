import { Hono } from "hono";
import { USERS, vulnState } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ レート制限なし — 無制限にログイン試行が可能
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  vulnState.attemptCount++;

  if (!username || !password) {
    return c.json({ success: false, message: "入力が不足しています" }, 400);
  }

  // ⚠️ 試行回数の制限なし
  const isValid = USERS[username] === password;

  return c.json({
    success: isValid,
    message: isValid ? `${username} としてログインしました` : "ユーザー名またはパスワードが違います",
    _debug: {
      message: "レート制限なし: 何度でもログイン試行が可能",
      totalAttempts: vulnState.attemptCount,
    },
  }, isValid ? 200 : 401);
});

export default app;
