import { Hono } from "hono";
import { USERS, loginAttempts } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15分

// ✅ IP単位のレート制限 + アカウントロック
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const ip = c.req.header("x-forwarded-for") || "127.0.0.1";
  const key = `${ip}:${username}`;

  if (!username || !password) {
    return c.json({ success: false, message: "入力が不足しています" }, 400);
  }

  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, lastAttempt: 0, lockedUntil: 0 };

  // ✅ アカウントロック判定
  if (record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return c.json({
      success: false,
      message: `アカウントがロックされています。${remainingSec}秒後に再試行してください`,
      locked: true,
      remainingSeconds: remainingSec,
    }, 429);
  }

  const isValid = USERS[username] === password;

  if (isValid) {
    // ✅ ログイン成功時はカウンターをリセット
    loginAttempts.delete(key);
    return c.json({ success: true, message: `${username} としてログインしました` });
  }

  // ✅ 失敗時はカウンターを増加
  record.count++;
  record.lastAttempt = now;

  // ✅ 上限超過でアカウントロック
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_DURATION_MS;
    loginAttempts.set(key, record);
    return c.json({
      success: false,
      message: `ログイン試行回数の上限(${MAX_ATTEMPTS}回)に達しました。15分間ロックされます`,
      locked: true,
      attemptsUsed: record.count,
    }, 429);
  }

  loginAttempts.set(key, record);
  return c.json({
    success: false,
    message: "ユーザー名またはパスワードが違います",
    attemptsRemaining: MAX_ATTEMPTS - record.count,
  }, 401);
});

export default app;
