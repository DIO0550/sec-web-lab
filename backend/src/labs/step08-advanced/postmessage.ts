import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: postMessage Vulnerability
// window.postMessage のオリジン検証不備
// ========================================

// --- 脆弱バージョン ---

// ⚠️ オリジン検証なしでメッセージを処理するページを返す
app.get("/vulnerable/receiver", (c) => {
  return c.json({
    success: true,
    description: "postMessageのオリジン検証なしのレシーバー",
    code: `
// ⚠️ 脆弱なpostMessageハンドラー
window.addEventListener("message", (event) => {
  // ⚠️ event.origin を検証していない
  // 任意のオリジンからのメッセージを信頼してしまう
  const data = event.data;
  if (data.action === "updateProfile") {
    document.getElementById("name").textContent = data.name;
  }
  if (data.action === "redirect") {
    window.location.href = data.url; // ⚠️ 任意のURLにリダイレクト
  }
});`,
    _debug: {
      message: "event.origin の検証なし: 攻撃者のサイトから任意のメッセージを送信可能",
      risks: [
        "XSS的な攻撃（DOM操作）",
        "オープンリダイレクト",
        "機密データの窃取（postMessageでデータを返す場合）",
      ],
    },
  });
});

// ⚠️ メッセージ処理のシミュレーション
app.post("/vulnerable/process-message", async (c) => {
  const body = await c.req.json<{ origin: string; data: Record<string, unknown> }>();
  const { origin, data } = body;

  // ⚠️ オリジン検証なし — 任意のオリジンからのメッセージを処理
  return c.json({
    success: true,
    processed: true,
    receivedFrom: origin,
    data,
    _debug: {
      message: `オリジン "${origin}" からのメッセージを検証なしで処理しました`,
    },
  });
});

// --- 安全バージョン ---

// ✅ オリジン検証付きのレシーバー
app.get("/secure/receiver", (c) => {
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
app.post("/secure/process-message", async (c) => {
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
