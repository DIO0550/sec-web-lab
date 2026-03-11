import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ HSTS設定 + Secure/HttpOnly/SameSite Cookie
app.post("/login", async (c) => {
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
