import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: ReDoS (Regular Expression Denial of Service)
// 危険な正規表現パターンによるCPUリソース枯渇
// ========================================

// --- 脆弱バージョン ---

// ⚠️ 危険な正規表現パターン（バックトラッキングが爆発する）
app.post("/vulnerable/validate", async (c) => {
  const body = await c.req.json<{ input: string; pattern?: string }>();
  const { input, pattern } = body;

  if (!input) {
    return c.json({ success: false, message: "入力値を指定してください" }, 400);
  }

  // ⚠️ 危険なパターン: (a+)+ はバックトラッキングが指数関数的に増加
  const regexPattern = pattern || "^(a+)+$";

  const start = performance.now();
  try {
    // ⚠️ タイムアウトなしで実行
    const regex = new RegExp(regexPattern);
    const matched = regex.test(input);
    const elapsed = performance.now() - start;

    return c.json({
      success: true,
      matched,
      elapsed: `${elapsed.toFixed(2)}ms`,
      _debug: {
        message: elapsed > 100
          ? "ReDoS検出: バックトラッキングによりCPU時間が急増しています"
          : "正常な処理時間",
        pattern: regexPattern,
        inputLength: input.length,
      },
    });
  } catch (err) {
    const elapsed = performance.now() - start;
    return c.json({
      success: false,
      message: `正規表現エラー: ${(err as Error).message}`,
      elapsed: `${elapsed.toFixed(2)}ms`,
    }, 500);
  }
});

// --- 安全バージョン ---

// ✅ 安全な正規表現パターン + タイムアウト
app.post("/secure/validate", async (c) => {
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
