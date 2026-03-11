import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 外部エンティティ参照を無効化してからパース
app.post("/import", async (c) => {
  const body = await c.req.text();

  if (!body) {
    return c.json({ success: false, message: "XMLデータを入力してください" }, 400);
  }

  try {
    // ✅ DOCTYPE宣言を検出したら拒否（外部エンティティの防止）
    if (body.includes("<!DOCTYPE") || body.includes("<!ENTITY")) {
      return c.json({
        success: false,
        message: "DOCTYPE宣言を含むXMLは処理できません（XXE防止）",
        _debug: {
          message: "外部エンティティ参照を含むXMLを拒否しました",
        },
      }, 400);
    }

    // ✅ エンティティ参照なしで安全にパース
    const nameMatch = body.match(/<name>(.*?)<\/name>/s);
    const emailMatch = body.match(/<email>(.*?)<\/email>/s);

    return c.json({
      success: true,
      parsed: {
        name: nameMatch?.[1] || "",
        email: emailMatch?.[1] || "",
      },
    });
  } catch (err) {
    return c.json({
      success: false,
      message: "XMLの処理中にエラーが発生しました",
    }, 500);
  }
});

export default app;
