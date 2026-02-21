import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Eval Injection
// ユーザー入力をコードとして実行してしまう
// ========================================

// --- 脆弱バージョン ---

// ⚠️ eval() でユーザー入力を直接実行
// 数式の計算機能だが、任意のJSコードが実行可能
app.post("/vulnerable/calculate", async (c) => {
  const body = await c.req.json<{ expression: string }>();
  const { expression } = body;

  if (!expression) {
    return c.json({ success: false, message: "数式を入力してください" }, 400);
  }

  try {
    // ⚠️ ユーザー入力をeval()で直接実行
    // 例: "1+1" は計算されるが "process.env" や "require('fs').readFileSync('/etc/passwd')" も実行可能
    // eslint-disable-next-line no-eval
    const result = eval(expression);

    return c.json({
      success: true,
      expression,
      result: String(result),
      _debug: {
        message: "eval()でユーザー入力を直接実行: 任意のコードが実行可能（RCE）",
        type: typeof result,
      },
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `実行エラー: ${(err as Error).message}`,
      _debug: {
        message: "eval()のエラー。悪意あるコードでもエラーが出るとは限らない",
      },
    }, 500);
  }
});

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

app.post("/secure/calculate", async (c) => {
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
