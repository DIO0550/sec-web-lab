import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ オリジン検証なしでメッセージを処理するページを返す
app.get("/receiver", (c) => {
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
app.post("/process-message", async (c) => {
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

export default app;
