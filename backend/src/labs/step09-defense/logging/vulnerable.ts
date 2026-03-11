import { Hono } from "hono";
import { addLog } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ パスワードやトークンをそのままログに記録
app.post("/login", async (c) => {
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

export default app;
