import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ HSTS未設定・Secure属性なし — HTTPでの通信が可能
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (username === "admin" && password === "admin123") {
    // ⚠️ Secure属性なし — HTTPでもCookieが送信される
    // ⚠️ HttpOnly属性なし — JavaScriptからアクセス可能
    c.header("Set-Cookie", `session=abc123; Path=/`);

    return c.json({
      success: true,
      message: "ログイン成功",
      _debug: {
        message: "HSTS未設定 + Cookie Secure属性なし: HTTP平文通信でCookieが漏洩する",
        cookie: "session=abc123; Path=/ (Secure属性なし, HttpOnly属性なし)",
        risks: [
          "HTTPでパスワードが平文送信される",
          "CookieがHTTP接続でも送信される",
          "中間者攻撃でセッションを盗める",
        ],
      },
    });
  }

  return c.json({ success: false, message: "認証失敗" }, 401);
});

export default app;
