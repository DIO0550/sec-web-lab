import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Cache Control
// キャッシュ制御の不備による情報漏洩
// ========================================

// --- 脆弱バージョン ---

// ⚠️ Cache-Control ヘッダー未設定 — 機密データがキャッシュに残る
app.get("/vulnerable/profile", (c) => {
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

// --- 安全バージョン ---

// ✅ 適切なキャッシュ制御ヘッダーを設定
app.get("/secure/profile", (c) => {
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
