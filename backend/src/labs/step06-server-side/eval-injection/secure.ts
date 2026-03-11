import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 数式のみ許可する安全な計算機
// 許可する文字: 数字、四則演算子、括弧、小数点、スペース
const SAFE_EXPRESSION_PATTERN = /^[0-9+\-*/().%\s]+$/;

function safeEvaluate(expr: string): number {
  // ✅ ホワイトリストで安全な文字のみ許可
  if (!SAFE_EXPRESSION_PATTERN.test(expr)) {
    throw new Error("許可されていない文字が含まれています");
  }

  // ✅ Function コンストラクタで厳格に評価（グローバルスコープへのアクセスなし）
  // ただし、これも完全ではないため、本番ではmath.jsなどのライブラリを推奨
  const fn = new Function(`"use strict"; return (${expr});`);
  const result = fn();

  if (typeof result !== "number" || !isFinite(result)) {
    throw new Error("計算結果が数値ではありません");
  }

  return result;
}

app.post("/calculate", async (c) => {
  const body = await c.req.json<{ expression: string }>();
  const { expression } = body;

  if (!expression) {
    return c.json({ success: false, message: "数式を入力してください" }, 400);
  }

  try {
    const result = safeEvaluate(expression);

    return c.json({
      success: true,
      expression,
      result: String(result),
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `計算エラー: ${(err as Error).message}`,
    }, 400);
  }
});

export default app;
