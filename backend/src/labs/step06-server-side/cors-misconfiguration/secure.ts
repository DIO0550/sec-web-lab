import { Hono } from "hono";
import { users, ALLOWED_ORIGINS } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ホワイトリストで許可オリジンを制限
app.get("/profile", (c) => {
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
app.options("/profile", (c) => {
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
