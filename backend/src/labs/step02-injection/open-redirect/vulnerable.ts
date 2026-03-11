import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ オープンリダイレクト: URLパラメータの値を検証せずにリダイレクトする
// /redirect?url=https://evil.example.com で外部サイトに誘導できる
app.get("/redirect", (c) => {
  const url = c.req.query("url");

  if (!url) {
    return c.json({
      message: "url パラメータにリダイレクト先を指定してください",
      examples: [
        "/api/labs/open-redirect/vulnerable/redirect?url=/dashboard",
        "/api/labs/open-redirect/vulnerable/redirect?url=https://evil.example.com",
      ],
    });
  }

  // ⚠️ リダイレクト先を検証せずにそのまま使用
  // 外部URLも含めてどんなURLにもリダイレクトしてしまう
  return c.redirect(url);
});

// ⚠️ リダイレクト情報をJSONで返す（フロントエンド連携用）
// 実際のリダイレクトは行わず、Location ヘッダーの値を返す
app.get("/check", (c) => {
  const url = c.req.query("url") ?? "";

  // ⚠️ 検証なし — そのまま返す
  return c.json({
    input: url,
    wouldRedirectTo: url || null,
    isExternal: url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"),
    blocked: false,
  });
});

export default app;
