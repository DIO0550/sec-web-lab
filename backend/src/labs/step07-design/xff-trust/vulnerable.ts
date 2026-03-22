import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

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

// ⚠️ X-Forwarded-Forの先頭値を無条件にクライアントIPとして信頼
function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  // ⚠️ X-Forwarded-Forの最初の値をそのまま使用
  // → 攻撃者がヘッダを変えるたびに異なるIPとして認識される
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  return "127.0.0.1";
}

// ⚠️ レート制限付きログインエンドポイント
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
          message: "X-Forwarded-Forの先頭値をIPとして使用",
          detectedIp: clientIp,
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
        message: "X-Forwarded-Forの先頭値をIPとして使用",
        detectedIp: clientIp,
      },
    },
    401
  );
});

// ⚠️ 検出されたクライアントIPを返すデバッグエンドポイント
app.get("/whoami", (c) => {
  const clientIp = getClientIp(c);
  return c.json({
    clientIp,
    xff: c.req.header("x-forwarded-for") || null,
    _debug: {
      message: "X-Forwarded-Forの先頭値をクライアントIPとして返却",
    },
  });
});

export default app;
