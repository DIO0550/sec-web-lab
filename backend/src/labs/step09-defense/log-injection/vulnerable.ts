import { Hono } from "hono";
import { addLog } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ユーザー入力をそのままログに記録（改行コード注入可能）
app.post("/login", async (c) => {
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

export default app;
