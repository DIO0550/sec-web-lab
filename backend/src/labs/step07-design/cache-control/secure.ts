import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 適切なキャッシュ制御ヘッダーを設定
app.get("/profile", (c) => {
  // ✅ キャッシュ無効化（機密データ用）
  c.header("Cache-Control", "no-store, no-cache, must-revalidate, private");
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");

  return c.json({
    success: true,
    profile: {
      name: "田中太郎",
      email: "tanaka@example.com",
      phone: "090-1234-5678",
      creditCard: "**** **** **** 1234",
    },
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
});

export default app;
