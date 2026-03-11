import { Hono } from "hono";
import { users } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ Originヘッダーをそのまま反映（全オリジン許可と同等）
// credentials: true と組み合わせると、任意のオリジンから認証付きリクエストが可能
app.get("/profile", (c) => {
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
app.options("/profile", (c) => {
  const origin = c.req.header("Origin") || "*";
  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return c.body(null, 204);
});

export default app;
