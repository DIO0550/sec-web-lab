import { Hono } from "hono";
import { randomUUID } from "node:crypto";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ Hostヘッダ（またはX-Custom-Hostヘッダ）を信頼してリセットリンクを生成
// フロントエンドからはブラウザの制限によりHostヘッダを直接変更できないため、
// X-Custom-Host ヘッダで代替する
app.post("/reset-request", async (c) => {
  const body = await c.req.json<{ email: string }>();
  const { email } = body;

  if (!email) {
    return c.json(
      { success: false, message: "メールアドレスを入力してください" },
      400
    );
  }

  const token = randomUUID();

  // ⚠️ X-Custom-Host ヘッダ → Host ヘッダ → デフォルトの順に使用
  // 攻撃者がX-Custom-Hostに evil.example.com を指定するとリンクが偽装される
  const host =
    c.req.header("x-custom-host") ||
    c.req.header("x-forwarded-host") ||
    c.req.header("host") ||
    "localhost:5173";

  // ⚠️ Hostヘッダの値を検証せずにリセットリンクに使用
  const resetLink = `https://${host}/reset?token=${token}`;

  return c.json({
    success: true,
    message: "リセットメールを送信しました",
    resetLink,
    token,
    _debug: {
      message: "Hostヘッダの値を検証せずにリセットリンクのドメインに使用",
      usedHost: host,
    },
  });
});

export default app;
