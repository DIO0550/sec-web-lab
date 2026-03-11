import { Hono } from "hono";
import { base64UrlDecode, hmacSign, createJwt, SECRET } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

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

// ✅ JWT検証 — アルゴリズムを固定し、alg=noneを拒否
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

    // ✅ アルゴリズムをHS256に固定（alg=none や RS256 を拒否）
    if (header.alg !== "HS256") {
      return c.json({
        success: false,
        message: `許可されていないアルゴリズム: ${header.alg}`,
      }, 401);
    }

    // ✅ 署名を必ず検証
    const expectedSig = await hmacSign(`${parts[0]}.${parts[1]}`, SECRET);
    if (parts[2] !== expectedSig) {
      return c.json({ success: false, message: "署名が無効です" }, 401);
    }

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return c.json({ success: true, profile: payload });
  } catch {
    return c.json({ success: false, message: "トークンのパースに失敗" }, 401);
  }
});

export default app;
