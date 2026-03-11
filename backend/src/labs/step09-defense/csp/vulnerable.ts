import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ CSPヘッダーなし — インラインスクリプトや外部リソースの読み込みが制限されない
app.get("/page", (c) => {
  const userInput = c.req.query("name") || "World";

  // ⚠️ CSPなし + XSSがある場合、スクリプトが実行される
  return c.json({
    success: true,
    html: `<h1>Hello, ${userInput}</h1>`,
    cspHeader: "(未設定)",
    _debug: {
      message: "CSP未設定: インラインスクリプトや外部リソースの読み込みが制限されない",
      xssPayload: '<script>alert("XSS")</script>',
      risks: [
        "インラインスクリプト実行",
        "外部JSファイルの読み込み",
        "eval()の実行",
        "外部CSSの注入",
      ],
    },
  });
});

export default app;
