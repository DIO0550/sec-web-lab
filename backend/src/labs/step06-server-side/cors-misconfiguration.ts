import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: CORS Misconfiguration
// オリジン間リソース共有の設定不備
// ========================================

// デモ用ユーザーデータ
const users: Record<string, { name: string; email: string; role: string }> = {
  "1": { name: "admin", email: "admin@example.com", role: "admin" },
  "2": { name: "user1", email: "user1@example.com", role: "user" },
};

// --- 脆弱バージョン ---

// ⚠️ Originヘッダーをそのまま反映（全オリジン許可と同等）
// credentials: true と組み合わせると、任意のオリジンから認証付きリクエストが可能
app.get("/vulnerable/profile", (c) => {
  const origin = c.req.header("Origin") || "*";
  const userId = c.req.query("userId") || "1";

  // ⚠️ リクエストのOriginをそのまま反映
  c.header("Access-Control-Allow-Origin", origin);
  // ⚠️ 認証情報の送信を許可
  c.header("Access-Control-Allow-Credentials", "true");

  const user = users[userId];
  if (!user) {
    return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
  }

  return c.json({
    success: true,
    profile: user,
    _debug: {
      message: "Originをそのまま反映: 任意のオリジンからCredentials付きリクエストが可能",
      reflectedOrigin: origin,
      corsHeaders: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    },
  });
});

// ⚠️ プリフライトリクエストも全許可
app.options("/vulnerable/profile", (c) => {
  const origin = c.req.header("Origin") || "*";
  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return c.body(null, 204);
});

// --- 安全バージョン ---

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://example.com",
];

// ✅ ホワイトリストで許可オリジンを制限
app.get("/secure/profile", (c) => {
  const origin = c.req.header("Origin") || "";
  const userId = c.req.query("userId") || "1";

  // ✅ ホワイトリスト方式でオリジンを検証
  if (ALLOWED_ORIGINS.includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
  }
  // ✅ 許可されていないオリジンにはCORSヘッダーを返さない

  const user = users[userId];
  if (!user) {
    return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
  }

  return c.json({
    success: true,
    profile: user,
  });
});

// ✅ プリフライトもホワイトリストで制限
app.options("/secure/profile", (c) => {
  const origin = c.req.header("Origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Access-Control-Allow-Methods", "GET");
    c.header("Access-Control-Allow-Headers", "Content-Type");
  }
  return c.body(null, 204);
});

export default app;
