import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// IPベースのレート制限カウンター
const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

const RATE_LIMIT = 5; // 1分間に5回まで
const WINDOW_MS = 60_000; // 1分

// テスト用の正しい認証情報
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "secretpass";

// ✅ X-Forwarded-Forを無視し、接続元IPを使用
// 開発環境ではソケットのremoteAddressが取得できない場合があるため、
// 固定値 "127.0.0.1" をフォールバックとする
function getClientIp(c: { req: { header: (name: string) => string | undefined }; env?: unknown }): string {
  // ✅ X-Forwarded-Forは無視し、実際の接続元IPを使用
  // 信頼できるプロキシリストがない場合はX-Forwarded-Forを一切使わない
  const env = c.env as Record<string, unknown> | undefined;
  const incoming = env?.incoming as { socket?: { remoteAddress?: string } } | undefined;
  return incoming?.socket?.remoteAddress || "127.0.0.1";
}

// ✅ レート制限付きログインエンドポイント（安全版）
app.post("/login", async (c) => {
  const clientIp = getClientIp(c);
  const now = Date.now();

  // レート制限チェック
  let entry = rateLimitMap.get(clientIp);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
  }

  entry.count++;
  rateLimitMap.set(clientIp, entry);

  if (entry.count > RATE_LIMIT) {
    return c.json(
      {
        success: false,
        message: "レート制限に達しました。1分後に再試行してください",
        locked: true,
        clientIp,
        attemptsUsed: entry.count,
        _debug: {
          message: "接続元IPを使用（X-Forwarded-Forを無視）",
          detectedIp: clientIp,
          ignoredXff: c.req.header("x-forwarded-for") || null,
        },
      },
      429
    );
  }

  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    return c.json({
      success: true,
      message: "ログイン成功",
      clientIp,
      attemptsUsed: entry.count,
    });
  }

  return c.json(
    {
      success: false,
      message: "ユーザー名またはパスワードが正しくありません",
      clientIp,
      attemptsUsed: entry.count,
      attemptsRemaining: RATE_LIMIT - entry.count,
      _debug: {
        message: "接続元IPを使用（X-Forwarded-Forを無視）",
        detectedIp: clientIp,
        ignoredXff: c.req.header("x-forwarded-for") || null,
      },
    },
    401
  );
});

// ✅ 実際の接続元IPを返すデバッグエンドポイント
app.get("/whoami", (c) => {
  const clientIp = getClientIp(c);
  return c.json({
    clientIp,
    xff: c.req.header("x-forwarded-for") || null,
    _debug: {
      message: "接続元IPを返却（X-Forwarded-Forを無視）",
    },
  });
});

export default app;
