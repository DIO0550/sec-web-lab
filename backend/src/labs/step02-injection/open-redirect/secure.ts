import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// 許可されたホスト名のリスト
const ALLOWED_HOSTS = ["localhost", "127.0.0.1"];

// ✅ URLを検証してリダイレクト先を判定する関数
function validateRedirectUrl(url: string): { allowed: boolean; reason: string } {
  // ✅ 相対パス（内部リダイレクト）を許可（ただし // で始まるものは拒否）
  if (url.startsWith("/") && !url.startsWith("//")) {
    return { allowed: true, reason: "内部パス（相対URL）" };
  }

  // ✅ javascript: スキームを拒否
  if (url.toLowerCase().startsWith("javascript:")) {
    return { allowed: false, reason: "javascript: スキームは許可されていません" };
  }

  // ✅ 絶対URLの場合はホスト名をチェック
  try {
    const parsed = new URL(url);
    if (ALLOWED_HOSTS.includes(parsed.hostname)) {
      return { allowed: true, reason: `許可されたホスト: ${parsed.hostname}` };
    }
    return { allowed: false, reason: `許可されていないホスト: ${parsed.hostname}` };
  } catch {
    return { allowed: false, reason: "不正なURL形式" };
  }
}

// ✅ ホワイトリスト検証付きリダイレクト
app.get("/redirect", (c) => {
  const url = c.req.query("url") ?? "/";

  const validation = validateRedirectUrl(url);

  if (validation.allowed) {
    return c.redirect(url);
  }

  // ✅ 許可されていないURLはトップページにリダイレクト
  return c.redirect("/");
});

// ✅ リダイレクト検証情報をJSONで返す（フロントエンド連携用）
app.get("/check", (c) => {
  const url = c.req.query("url") ?? "";

  const validation = validateRedirectUrl(url);

  return c.json({
    input: url,
    wouldRedirectTo: validation.allowed ? url : "/",
    isExternal: url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"),
    blocked: !validation.allowed,
    reason: validation.reason,
  });
});

export default app;
