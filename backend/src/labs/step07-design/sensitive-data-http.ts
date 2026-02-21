import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Sensitive Data over HTTP
// 暗号化されていない通信で機密データが平文で流れる
// ========================================

// --- 脆弱バージョン ---

// ⚠️ HSTS未設定・Secure属性なし — HTTPでの通信が可能
app.post("/vulnerable/login", async (c) => {
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

// --- 安全バージョン ---

// ✅ HSTS設定 + Secure/HttpOnly/SameSite Cookie
app.post("/secure/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (username === "admin" && password === "admin123") {
    // ✅ Strict-Transport-Security でHTTPS強制
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    // ✅ Secure, HttpOnly, SameSite=Strict で Cookie を保護
    c.header("Set-Cookie", `session=abc123; Path=/; Secure; HttpOnly; SameSite=Strict`);

    return c.json({
      success: true,
      message: "ログイン成功",
      protectedHeaders: {
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "Set-Cookie": "session=abc123; Path=/; Secure; HttpOnly; SameSite=Strict",
      },
    });
  }

  return c.json({ success: false, message: "認証失敗" }, 401);
});

export default app;
