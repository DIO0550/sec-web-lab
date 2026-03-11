import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ユーザー指定のURLをそのままfetchする
// 内部ネットワーク（localhost, 169.254.169.254 等）にもアクセス可能
app.post("/fetch", async (c) => {
  const body = await c.req.json<{ url: string }>();
  const { url } = body;

  if (!url) {
    return c.json({ success: false, message: "URLを入力してください" }, 400);
  }

  try {
    // ⚠️ ユーザー入力のURLを検証なしでfetch
    // → localhost, 内部IP, クラウドメタデータAPI等にアクセス可能
    const response = await fetch(url, { redirect: "follow" });
    const text = await response.text();

    return c.json({
      success: true,
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: text.substring(0, 2000),
      _debug: {
        message: "URL検証なし: 内部ネットワークやメタデータAPIにもアクセス可能",
        requestedUrl: url,
      },
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `リクエスト失敗: ${(err as Error).message}`,
    }, 500);
  }
});

export default app;
