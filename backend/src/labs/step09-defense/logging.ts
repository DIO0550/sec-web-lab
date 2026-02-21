import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Logging (不十分なログ / 機密情報のログ記録)
// ========================================

// ログ記録のシミュレーション
const logEntries: Array<{ timestamp: string; level: string; message: string; mode: string }> = [];

function addLog(level: string, message: string, mode: string) {
  logEntries.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    mode,
  });
}

// --- 脆弱バージョン ---

// ⚠️ パスワードやトークンをそのままログに記録
app.post("/vulnerable/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  // ⚠️ パスワードを含むログ
  addLog("INFO", `Login attempt: username=${username}, password=${password}`, "vulnerable");

  const success = username === "admin" && password === "admin123";
  if (success) {
    const token = "secret-token-abc123";
    // ⚠️ トークンをそのままログに記録
    addLog("INFO", `Login success: username=${username}, token=${token}`, "vulnerable");
    return c.json({
      success: true,
      message: "ログイン成功",
      _debug: {
        message: "パスワードとトークンがログに平文で記録されている",
      },
    });
  }

  addLog("WARN", `Login failed: username=${username}, password=${password}`, "vulnerable");
  return c.json({ success: false, message: "認証失敗" }, 401);
});

// --- 安全バージョン ---

// ✅ 機密情報をマスクしてログに記録
app.post("/secure/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  // ✅ パスワードをマスク
  addLog("INFO", `Login attempt: username=${username}, password=***`, "secure");

  const success = username === "admin" && password === "admin123";
  if (success) {
    // ✅ トークンはログに記録しない
    addLog("INFO", `Login success: username=${username}`, "secure");
    return c.json({ success: true, message: "ログイン成功" });
  }

  // ✅ 失敗理由の詳細はログに含めない
  addLog("WARN", `Login failed: username=${username}`, "secure");
  return c.json({ success: false, message: "認証失敗" }, 401);
});

// ログ閲覧
app.get("/logs", (c) => {
  return c.json({ logs: logEntries });
});

// リセット
app.post("/reset", (c) => {
  logEntries.length = 0;
  return c.json({ message: "ログをクリアしました" });
});

export default app;
