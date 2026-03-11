import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ Cache-Control ヘッダー未設定 — 機密データがキャッシュに残る
app.get("/profile", (c) => {
  // ⚠️ キャッシュ制御ヘッダーなし
  // → ブラウザ、プロキシ、CDN にキャッシュされる可能性がある
  return c.json({
    success: true,
    profile: {
      name: "田中太郎",
      email: "tanaka@example.com",
      phone: "090-1234-5678",
      creditCard: "**** **** **** 1234",
    },
    _debug: {
      message: "Cache-Control 未設定: 機密データがブラウザキャッシュやCDNに残存する",
      risks: [
        "共有PCのブラウザキャッシュから個人情報が漏洩",
        "CDNキャッシュで他ユーザーの情報が表示される",
        "戻るボタンでログアウト後もデータが表示される",
      ],
    },
  });
});

export default app;
