import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ 入力バリデーションなし — 任意の値が受け付けられる
app.post("/register", async (c) => {
  const body = await c.req.json<{ username: string; email: string; age: number; website: string }>();
  const { username, email, age, website } = body;

  // ⚠️ 検証なしでそのまま使用
  return c.json({
    success: true,
    message: "登録が完了しました",
    user: { username, email, age, website },
    _debug: {
      message: "入力バリデーションなし: 任意の値が受け付けられる",
      risks: [
        "username に SQL や HTML を含む値が可能",
        "email が不正な形式でも受け付けられる",
        "age に負の値や巨大な数値が可能",
        "website に javascript: スキームが可能",
      ],
    },
  });
});

export default app;
