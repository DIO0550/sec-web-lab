import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ eval() でユーザー入力を直接実行
// 数式の計算機能だが、任意のJSコードが実行可能
app.post("/calculate", async (c) => {
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

export default app;
