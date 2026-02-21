import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: CSP (Content Security Policy)
// XSS対策としてのCSP設定
// ========================================

// --- 脆弱バージョン ---

// ⚠️ CSPヘッダーなし — インラインスクリプトや外部リソースの読み込みが制限されない
app.get("/vulnerable/page", (c) => {
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

// --- 安全バージョン ---

// ✅ 適切なCSPヘッダーを設定
app.get("/secure/page", (c) => {
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

// CSPの検証シミュレーション
app.post("/check-csp", async (c) => {
  const body = await c.req.json<{ csp: string; payload: string }>();
  const { csp, payload } = body;

  const violations: string[] = [];

  if (payload.includes("<script>") && !csp.includes("'unsafe-inline'")) {
    violations.push("インラインスクリプトがCSPによりブロックされます");
  }
  if (payload.includes("eval(") && !csp.includes("'unsafe-eval'")) {
    violations.push("eval()がCSPによりブロックされます");
  }
  if (payload.includes("src=") && csp.includes("script-src 'self'")) {
    violations.push("外部スクリプトの読み込みがCSPによりブロックされます");
  }

  return c.json({
    success: true,
    violations,
    blocked: violations.length > 0,
  });
});

export default app;
