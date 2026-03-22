import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 改行コードを除去する関数 — ヘッダーインジェクションを防止
// \r と \n を除去することで、ヘッダーの区切りとして機能するCRLFを無害化
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]/g, "");
}

// ✅ メールヘッダーインジェクション対策: 改行文字を除去してからヘッダー組み立て
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

  // ✅ 全ヘッダー値から改行コードを除去
  // "お問い合わせ\r\nBcc: attacker@evil.com" は
  // "お問い合わせBcc: attacker@evil.com" になり、
  // Bcc が独立したヘッダーとして解釈されない
  const safeFrom = sanitizeHeaderValue(from);
  const safeSubject = sanitizeHeaderValue(subject);

  const headers = [
    `From: ${safeFrom}`,
    `To: support@example.com`,
    `Subject: ${safeSubject}`,
    `Content-Type: text/plain; charset=UTF-8`,
  ].join("\r\n");

  const message = `${headers}\r\n\r\n${mailBody}`;

  // メール送信をシミュレーション（実際には送信しない）
  console.log("[SECURE] 生成されたメール:\n", message);

  return c.json({
    success: true,
    message: "メールを送信しました（安全版）",
    generatedHeaders: headers,
    sanitizedFrom: safeFrom,
    sanitizedSubject: safeSubject,
    _debug: {
      info: "改行コードは除去されているため、追加のヘッダーは注入できません",
    },
  });
});

export default app;
