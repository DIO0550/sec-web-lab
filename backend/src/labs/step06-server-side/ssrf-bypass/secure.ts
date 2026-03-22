import { Hono } from "hono";
import { promises as dns } from "node:dns";
import { isIP } from "node:net";

const app = new Hono();

// --- 安全バージョン ---

// ✅ プライベートIPアドレスの判定（IPv4）
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false;
  return (
    parts[0] === 127 || // 127.0.0.0/8 ループバック
    parts[0] === 10 || // 10.0.0.0/8
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
    (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
    (parts[0] === 169 && parts[1] === 254) || // 169.254.0.0/16 リンクローカル
    ip === "0.0.0.0" // 全インターフェース
  );
}

// ✅ プライベートIPv6アドレスの判定
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" || // ループバック
    normalized.startsWith("fc") || // ユニークローカル
    normalized.startsWith("fd") || // ユニークローカル
    normalized.startsWith("fe80") || // リンクローカル
    normalized.startsWith("::ffff:") // IPv4マップドIPv6
  );
}

// ✅ DNS解決後のIPアドレスを検証してからfetch
app.post("/fetch", async (c) => {
  const body = await c.req.json<{ url: string }>();
  const { url } = body;

  if (!url) {
    return c.json({ success: false, message: "URLを入力してください" }, 400);
  }

  try {
    const parsed = new URL(url);

    // ✅ プロトコルをHTTP/HTTPSに限定
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return c.json(
        {
          success: false,
          message: `許可されていないプロトコル: ${parsed.protocol}`,
        },
        400
      );
    }

    // ✅ ホスト名をDNS解決して実際のIPアドレスを取得
    const hostname = parsed.hostname.replace(/^\[|\]$/g, ""); // IPv6のブラケットを除去
    let resolvedIP: string;

    if (isIP(hostname)) {
      // 直接IPが指定された場合（10進数、IPv6形式のみ。16進数・8進数はisIPで検出されない場合がある）
      resolvedIP = hostname;
    } else {
      try {
        const addresses = await dns.resolve4(hostname);
        resolvedIP = addresses[0];
      } catch {
        // IPv4で解決できない場合はIPv6を試行
        try {
          const addresses6 = await dns.resolve6(hostname);
          resolvedIP = addresses6[0];
        } catch {
          return c.json(
            { success: false, message: "ホスト名を解決できません" },
            400
          );
        }
      }
    }

    // ✅ 解決済みIPアドレスがプライベートIPかチェック
    if (isPrivateIPv4(resolvedIP) || isPrivateIPv6(resolvedIP)) {
      return c.json(
        {
          success: false,
          message: "内部ネットワークへのアクセスは禁止されています",
          _debug: {
            message:
              "DNS解決後のIPアドレスがプライベートIPレンジに含まれるためブロック",
            resolvedIP,
            originalHostname: parsed.hostname,
          },
        },
        403
      );
    }

    // ✅ リダイレクトを手動制御（リダイレクト先のチェックも必要）
    const response = await fetch(url, { redirect: "manual" });
    const text = await response.text();

    return c.json({
      success: true,
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: text.substring(0, 2000),
      _debug: {
        message: "DNS解決後のIPアドレス検証を通過",
        resolvedIP,
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
