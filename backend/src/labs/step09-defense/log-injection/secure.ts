import { Hono } from "hono";
import { addLog } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ユーザー入力をサニタイズしてからログに記録
function sanitizeForLog(input: string): string {
  // ✅ 改行コード、制御文字を除去
  return input.replace(/[\r\n\x00-\x1f]/g, "").substring(0, 100);
}

app.post("/login", async (c) => {
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

export default app;
