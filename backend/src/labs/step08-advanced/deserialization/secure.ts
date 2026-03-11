import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ホワイトリストで許可するプロパティのみ抽出
app.post("/deserialize", async (c) => {
  const body = await c.req.text();

  if (!body) {
    return c.json({ success: false, message: "データを入力してください" }, 400);
  }

  try {
    const data = JSON.parse(body);

    // ✅ 型チェック
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return c.json({ success: false, message: "オブジェクト形式のJSONが必要です" }, 400);
    }

    // ✅ 危険なプロパティを拒否
    const dangerousKeys = ["__type", "__proto__", "constructor", "prototype", "command", "exec"];
    const foundDangerous = Object.keys(data).filter((k) => dangerousKeys.includes(k));
    if (foundDangerous.length > 0) {
      return c.json({
        success: false,
        message: `危険なプロパティが含まれています: ${foundDangerous.join(", ")}`,
      }, 400);
    }

    // ✅ ホワイトリストで許可するプロパティのみ抽出
    const ALLOWED_KEYS = ["name", "email", "age", "message"];
    const sanitized: Record<string, unknown> = {};
    for (const key of ALLOWED_KEYS) {
      if (key in data) {
        sanitized[key] = String(data[key]); // ✅ 値も文字列に正規化
      }
    }

    return c.json({
      success: true,
      message: "安全にデシリアライズしました",
      data: sanitized,
    });
  } catch (err) {
    return c.json({ success: false, message: "JSONの処理中にエラーが発生しました" }, 400);
  }
});

export default app;
