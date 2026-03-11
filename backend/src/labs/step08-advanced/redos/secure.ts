import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 安全な正規表現パターン + タイムアウト
app.post("/validate", async (c) => {
  const body = await c.req.json<{ input: string }>();
  const { input } = body;

  if (!input) {
    return c.json({ success: false, message: "入力値を指定してください" }, 400);
  }

  // ✅ 入力長を制限
  if (input.length > 1000) {
    return c.json({ success: false, message: "入力が長すぎます（最大1000文字）" }, 400);
  }

  // ✅ 安全な正規表現パターン（量指定子のネストなし）
  const safePattern = /^a+$/;

  const start = performance.now();
  const matched = safePattern.test(input);
  const elapsed = performance.now() - start;

  return c.json({
    success: true,
    matched,
    elapsed: `${elapsed.toFixed(2)}ms`,
  });
});

export default app;
