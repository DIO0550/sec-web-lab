import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Log Injection
// ログへの改行コード注入によるログ改ざん
// ========================================

const logEntries: Array<{ timestamp: string; message: string; mode: string }> = [];

function addLog(message: string, mode: string) {
  logEntries.push({
    timestamp: new Date().toISOString(),
    message,
    mode,
  });
}

// --- 脆弱バージョン ---

// ⚠️ ユーザー入力をそのままログに記録（改行コード注入可能）
app.post("/vulnerable/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  // ⚠️ ユーザー名をサニタイズせずにログに記録
  // 攻撃者が username に改行コードを含めると偽のログ行を作成できる
  // 例: "admin\n[INFO] Login success: username=admin" → 正規のログインに見える
  addLog(`Login attempt: username=${username}`, "vulnerable");

  const success = username === "admin" && password === "admin123";
  if (success) {
    addLog(`Login success: username=${username}`, "vulnerable");
    return c.json({
      success: true,
      message: "ログイン成功",
      _debug: {
        message: "ユーザー入力がログにそのまま記録される（改行コード注入可能）",
      },
    });
  }

  addLog(`Login failed: username=${username}`, "vulnerable");
  return c.json({ success: false, message: "認証失敗" }, 401);
});

// --- 安全バージョン ---

// ✅ ユーザー入力をサニタイズしてからログに記録
function sanitizeForLog(input: string): string {
  // ✅ 改行コード、制御文字を除去
  return input.replace(/[\r\n\x00-\x1f]/g, "").substring(0, 100);
}

app.post("/secure/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  // ✅ サニタイズしてからログに記録
  const safeUsername = sanitizeForLog(username);
  addLog(`Login attempt: username=${safeUsername}`, "secure");

  const success = username === "admin" && password === "admin123";
  if (success) {
    addLog(`Login success: username=${safeUsername}`, "secure");
    return c.json({ success: true, message: "ログイン成功" });
  }

  addLog(`Login failed: username=${safeUsername}`, "secure");
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
