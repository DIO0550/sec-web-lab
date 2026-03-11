import { Hono } from "hono";
import { addLog } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 機密情報をマスクしてログに記録
app.post("/login", async (c) => {
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

export default app;
