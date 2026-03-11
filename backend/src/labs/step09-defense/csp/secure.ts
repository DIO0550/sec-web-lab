import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 適切なCSPヘッダーを設定
app.get("/page", (c) => {
  const userInput = c.req.query("name") || "World";

  // ✅ Content Security Policy で許可するリソースを制限
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  c.header("Content-Security-Policy", csp);

  // ✅ XSSがあってもCSPによりスクリプト実行がブロックされる
  return c.json({
    success: true,
    html: `<h1>Hello, ${userInput}</h1>`,
    cspHeader: csp,
  });
});

export default app;
