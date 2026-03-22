import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ 内部テスト用エンドポイント（SSRFで到達される対象）
app.get("/internal", (c) => {
  return c.json({ secret: "内部APIの機密情報です" });
});

// ⚠️ ブロックリストが "localhost" と "127.0.0.1" の文字列一致のみ
// → 0x7f000001, 0177.0.0.1, [::1], 2130706433 等の代替表現で回避可能
app.post("/fetch", async (c) => {
  const body = await c.req.json<{ url: string }>();
  const { url } = body;

  if (!url) {
    return c.json({ success: false, message: "URLを入力してください" }, 400);
  }

  // ⚠️ 単純な文字列一致によるブロックリスト — 代替表現で回避可能
  const blocklist = ["localhost", "127.0.0.1"];
  const lowerUrl = url.toLowerCase();
  for (const blocked of blocklist) {
    if (lowerUrl.includes(blocked)) {
      return c.json(
        {
          success: false,
          message: `ブロックリストによりアクセスが拒否されました (${blocked})`,
          _debug: {
            message: "文字列一致チェックでブロック",
            blockedKeyword: blocked,
          },
        },
        403
      );
    }
  }

  try {
    // ⚠️ ブロックリストを通過したURLをそのままfetch
    const response = await fetch(url, { redirect: "follow" });
    const text = await response.text();

    return c.json({
      success: true,
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: text.substring(0, 2000),
      _debug: {
        message:
          "文字列一致のブロックリストを通過: IPアドレスの代替表現は検出されない",
        requestedUrl: url,
      },
    });
  } catch (err) {
    return c.json(
      {
        success: false,
        message: `リクエスト失敗: ${(err as Error).message}`,
      },
      500
    );
  }
});

export default app;
