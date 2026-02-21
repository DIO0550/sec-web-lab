import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: JWT Vulnerabilities
// JWT署名検証不備による認証バイパス
// ========================================

const SECRET = "super-secret-key-2024";

// 簡易Base64URL エンコード/デコード
function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64url");
}
function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString();
}

// 簡易HMAC-SHA256 署名
async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

// JWT生成
async function createJwt(payload: Record<string, unknown>, alg: string = "HS256"): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg, typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = alg === "none" ? "" : await hmacSign(`${header}.${body}`, SECRET);
  return `${header}.${body}.${signature}`;
}

// --- 脆弱バージョン ---

// ⚠️ ログイン — JWTトークン発行
app.post("/vulnerable/login", async (c) => {
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
app.get("/vulnerable/profile", async (c) => {
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

// --- 安全バージョン ---

app.post("/secure/login", async (c) => {
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
app.get("/secure/profile", async (c) => {
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
