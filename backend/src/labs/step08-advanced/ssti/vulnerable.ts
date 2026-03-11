import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ユーザー入力をテンプレート文字列として評価
app.post("/render", async (c) => {
  const body = await c.req.json<{ template: string; name?: string }>();
  const { template, name } = body;

  if (!template) {
    return c.json({ success: false, message: "テンプレートを入力してください" }, 400);
  }

  try {
    // ⚠️ テンプレート内の {{...}} を評価（任意のJS式が実行可能）
    let rendered = template;
    const expressionRegex = /\{\{(.+?)\}\}/g;
    const context = { name: name || "World", date: new Date().toLocaleDateString() };

    rendered = rendered.replace(expressionRegex, (_match, expr) => {
      try {
        // ⚠️ eval()でテンプレート式を評価 — 任意のコード実行が可能
        // eslint-disable-next-line no-eval
        const result = eval(expr.trim());
        return String(result);
      } catch (e) {
        return `[Error: ${(e as Error).message}]`;
      }
    });

    return c.json({
      success: true,
      rendered,
      _debug: {
        message: "テンプレート内の式をeval()で評価: 任意のコードが実行可能",
      },
    });
  } catch (err) {
    return c.json({ success: false, message: `レンダリングエラー: ${(err as Error).message}` }, 500);
  }
});

export default app;
