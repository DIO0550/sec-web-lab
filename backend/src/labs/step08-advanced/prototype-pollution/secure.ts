import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 安全なマージ（__proto__, constructor, prototype を拒否）
function safeMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    // ✅ 危険なキーを拒否
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
      if (!(key in target)) {
        target[key] = {};
      }
      safeMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

app.post("/merge", async (c) => {
  const body = await c.req.json();

  // ✅ Object.create(null) でプロトタイプなしオブジェクトを使用
  const config: Record<string, unknown> = Object.create(null);
  config.theme = "light";
  config.lang = "ja";

  safeMerge(config, body);

  return c.json({
    success: true,
    config,
  });
});

export default app;
