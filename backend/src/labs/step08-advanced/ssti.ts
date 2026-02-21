import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: SSTI (Server-Side Template Injection)
// テンプレートエンジンでユーザー入力が実行される
// ========================================

// --- 脆弱バージョン ---

// ⚠️ ユーザー入力をテンプレート文字列として評価
app.post("/vulnerable/render", async (c) => {
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

// --- 安全バージョン ---

// ✅ ユーザー入力はデータとして扱い、テンプレート式の実行を許可しない
app.post("/secure/render", async (c) => {
  const body = await c.req.json<{ template: string; name?: string }>();
  const { template, name } = body;

  if (!template) {
    return c.json({ success: false, message: "テンプレートを入力してください" }, 400);
  }

  // ✅ 許可する変数のみ置換（式の評価は行わない）
  const variables: Record<string, string> = {
    name: name || "World",
    date: new Date().toLocaleDateString(),
  };

  // ✅ {{変数名}} のみ置換（式の評価は拒否）
  let rendered = template;
  const varRegex = /\{\{(\w+)\}\}/g;
  rendered = rendered.replace(varRegex, (_match, varName) => {
    if (varName in variables) {
      return variables[varName];
    }
    return `{{${varName}}}`; // 未知の変数はそのまま
  });

  // ✅ 式を含むパターンを検出して警告
  const hasExpression = /\{\{.+[^}\w].+\}\}/.test(template);

  return c.json({
    success: true,
    rendered,
    ...(hasExpression && {
      warning: "テンプレート式の実行は許可されていません。変数名のみ使用してください。",
    }),
  });
});

export default app;
