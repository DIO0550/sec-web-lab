import { Hono } from "hono";
import { base64UrlDecode, hmacSign, createJwt, SECRET } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ログイン — JWTトークン発行
app.post("/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (username === "admin" && password === "admin123") {
    const token = await createJwt({ sub: username, role: "admin", iat: Math.floor(Date.now() / 1000) });
    return c.json({ success: true, message: "ログイン成功", token });
  }
  if (username === "user1" && password === "password1") {
    const token = await createJwt({ sub: username, role: "user", iat: Math.floor(Date.now() / 1000) });
    return c.json({ success: true, message: "ログイン成功", token });
  }

  return c.json({ success: false, message: "認証失敗" }, 401);
});

// ⚠️ JWT検証 — alg=none を許可してしまう
app.get("/profile", async (c) => {
  const auth = c.req.header("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return c.json({ success: false, message: "トークンが必要です" }, 401);
  }

  const token = auth.substring(7);
  const parts = token.split(".");
  if (parts.length !== 3) {
    return c.json({ success: false, message: "無効なトークン形式" }, 401);
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    // ⚠️ alg=none を許可（署名検証をスキップ）
    if (header.alg === "none") {
      // ⚠️ 署名なしでもペイロードを信頼してしまう
      return c.json({
        success: true,
        profile: payload,
        _debug: {
          message: "alg=none が許可されている: 署名なしのトークンでも受け入れられる",
          algorithm: header.alg,
        },
      });
    }

    // 署名検証
    const expectedSig = await hmacSign(`${parts[0]}.${parts[1]}`, SECRET);
    if (parts[2] !== expectedSig) {
      return c.json({ success: false, message: "署名が無効です" }, 401);
    }

    return c.json({
      success: true,
      profile: payload,
      _debug: {
        message: "署名検証OK（ただしalg=noneを許可するバグあり）",
        algorithm: header.alg,
      },
    });
  } catch {
    return c.json({ success: false, message: "トークンのパースに失敗" }, 401);
  }
});

export default app;
