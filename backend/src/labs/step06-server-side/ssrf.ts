import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: SSRF (Server-Side Request Forgery)
// サーバーを踏み台にした内部ネットワークへの不正アクセス
// ========================================

// --- 脆弱バージョン ---

// ⚠️ ユーザー指定のURLをそのままfetchする
// 内部ネットワーク（localhost, 169.254.169.254 等）にもアクセス可能
app.post("/vulnerable/fetch", async (c) => {
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

// --- 安全バージョン ---

// プライベートIPアドレスの判定
function isPrivateIP(hostname: string): boolean {
  // localhost
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return true;
  }
  // プライベートIPレンジ
  const privateRanges = [
    /^10\./,                          // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./,    // 172.16.0.0/12
    /^192\.168\./,                     // 192.168.0.0/16
    /^169\.254\./,                     // リンクローカル / AWS メタデータ
    /^0\./,                            // 0.0.0.0/8
  ];
  return privateRanges.some((range) => range.test(hostname));
}

// ✅ URLのプロトコルとホスト名を検証してからfetch
app.post("/secure/fetch", async (c) => {
  const body = await c.req.json<{ url: string }>();
  const { url } = body;

  if (!url) {
    return c.json({ success: false, message: "URLを入力してください" }, 400);
  }

  try {
    const parsed = new URL(url);

    // ✅ プロトコルをHTTP/HTTPSに限定
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return c.json({
        success: false,
        message: `許可されていないプロトコル: ${parsed.protocol}`,
      }, 400);
    }

    // ✅ プライベートIPアドレスへのアクセスを拒否
    if (isPrivateIP(parsed.hostname)) {
      return c.json({
        success: false,
        message: "内部ネットワークへのアクセスは禁止されています",
        _debug: {
          message: "プライベートIPアドレスへのリクエストをブロックしました",
          blockedHost: parsed.hostname,
        },
      }, 403);
    }

    // ✅ リダイレクトを手動制御（リダイレクト先が内部IPの場合もブロック）
    const response = await fetch(url, { redirect: "manual" });
    const text = await response.text();

    return c.json({
      success: true,
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: text.substring(0, 2000),
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `リクエスト失敗: ${(err as Error).message}`,
    }, 500);
  }
});

export default app;
