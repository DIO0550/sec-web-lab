import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ JWTをHttpOnly Cookieで返す
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (username === "admin" && password === "admin123") {
    const fakeJwt = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.fake_signature";

    // ✅ HttpOnly Cookie でトークンを設定（JavaScriptからアクセス不可）
    c.header("Set-Cookie", `token=${fakeJwt}; Path=/; HttpOnly; Secure; SameSite=Strict`);

    return c.json({
      success: true,
      message: "ログイン成功（トークンはHttpOnly Cookieに保存）",
      // ✅ トークンをレスポンスボディに含めない
    });
  }

  return c.json({ success: false, message: "認証失敗" }, 401);
});

// ✅ Cookie からトークンを自動送信
app.get("/profile", (c) => {
  const cookie = c.req.header("Cookie");
  if (!cookie || !cookie.includes("token=")) {
    return c.json({ success: false, message: "認証が必要です" }, 401);
  }

  return c.json({
    success: true,
    profile: { name: "admin", role: "admin" },
  });
});

export default app;
