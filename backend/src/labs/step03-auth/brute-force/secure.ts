import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from "../../shared/constants.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ レート制限用の試行回数追跡（IPごと）
// 本番では Redis 等の外部ストアを使用する
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// ✅ レート制限の状態を確認するエンドポイント（デモ用）
app.get("/status", (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "127.0.0.1";
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    return c.json({ ip, attempts: 0, maxAttempts: MAX_LOGIN_ATTEMPTS, locked: false });
  }

  const timeSinceLast = Date.now() - attempts.lastAttempt;
  const locked = attempts.count >= MAX_LOGIN_ATTEMPTS && timeSinceLast < LOCKOUT_DURATION_MS;
  const remainingMs = locked ? LOCKOUT_DURATION_MS - timeSinceLast : 0;

  return c.json({
    ip,
    attempts: attempts.count,
    maxAttempts: MAX_LOGIN_ATTEMPTS,
    locked,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  });
});

// ✅ レート制限リセット（デモ用）
app.post("/reset", (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "127.0.0.1";
  loginAttempts.delete(ip);
  return c.json({ message: "レート制限がリセットされました", ip });
});

// ✅ ログイン: レート制限あり — 一定回数以上の失敗でブロック
app.post("/login", async (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "127.0.0.1";
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  // ✅ レート制限チェック: 15分以内にMAX_LOGIN_ATTEMPTS回以上失敗していたら拒否
  const attempts = loginAttempts.get(ip);
  if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeSinceLast = Date.now() - attempts.lastAttempt;
    if (timeSinceLast < LOCKOUT_DURATION_MS) {
      const remainingSec = Math.ceil((LOCKOUT_DURATION_MS - timeSinceLast) / 1000);
      return c.json({
        success: false,
        message: `試行回数の上限（${MAX_LOGIN_ATTEMPTS}回）に達しました。${remainingSec}秒後に再試行してください。`,
        locked: true,
        remainingSeconds: remainingSec,
      }, 429);
    }
    // ロックアウト期間が経過したのでリセット
    loginAttempts.delete(ip);
  }

  try {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      // ✅ 失敗回数を記録
      const current = loginAttempts.get(ip) ?? { count: 0, lastAttempt: 0 };
      const newCount = current.count + 1;
      loginAttempts.set(ip, { count: newCount, lastAttempt: Date.now() });

      const remaining = MAX_LOGIN_ATTEMPTS - newCount;
      return c.json({
        success: false,
        message: `ユーザー名またはパスワードが違います（残り${remaining > 0 ? remaining : 0}回）`,
        attemptsUsed: newCount,
        maxAttempts: MAX_LOGIN_ATTEMPTS,
      }, 401);
    }

    // ✅ 成功したらカウントをリセット
    loginAttempts.delete(ip);
    return c.json({
      success: true,
      message: `${result.rows[0].username} としてログインしました`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Login error:", (err as Error).message);
    return c.json({ success: false, message: "処理中にエラーが発生しました" }, 500);
  }
});

export default app;
