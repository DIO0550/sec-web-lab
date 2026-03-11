import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ オリジン検証付きのレシーバー
app.get("/receiver", (c) => {
  return c.json({
    success: true,
    description: "postMessageのオリジン検証付きレシーバー",
    code: `
// ✅ 安全なpostMessageハンドラー
const ALLOWED_ORIGINS = ["https://trusted.example.com"];

window.addEventListener("message", (event) => {
  // ✅ オリジンを検証
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    console.warn("Rejected message from:", event.origin);
    return;
  }

  const data = event.data;
  // ✅ メッセージの型も検証
  if (typeof data !== "object" || !data.action) return;
  if (data.action === "updateProfile" && typeof data.name === "string") {
    document.getElementById("name").textContent = data.name;
  }
});`,
  });
});

// ✅ オリジン検証付きメッセージ処理
app.post("/process-message", async (c) => {
  const body = await c.req.json<{ origin: string; data: Record<string, unknown> }>();
  const { origin, data } = body;

  const ALLOWED_ORIGINS = ["http://localhost:5173", "https://trusted.example.com"];

  // ✅ オリジン検証
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return c.json({
      success: false,
      message: `許可されていないオリジン: ${origin}`,
    }, 403);
  }

  return c.json({
    success: true,
    processed: true,
    receivedFrom: origin,
    data,
  });
});

export default app;
