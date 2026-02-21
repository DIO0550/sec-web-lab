import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Input Validation (入力バリデーション設計)
// すべてのユーザー入力をサーバー側で検証
// ========================================

// --- 脆弱バージョン ---

// ⚠️ 入力バリデーションなし — 任意の値が受け付けられる
app.post("/vulnerable/register", async (c) => {
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

// --- 安全バージョン ---

// ✅ サーバー側で厳格な入力バリデーション
app.post("/secure/register", async (c) => {
  const body = await c.req.json<{ username: string; email: string; age: number; website: string }>();
  const { username, email, age, website } = body;
  const errors: string[] = [];

  // ✅ ユーザー名: 英数字とアンダースコアのみ、3-20文字
  if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    errors.push("ユーザー名は英数字とアンダースコアで3〜20文字にしてください");
  }

  // ✅ メールアドレス: 基本的な形式チェック
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("有効なメールアドレスを入力してください");
  }

  // ✅ 年齢: 0-150の整数
  if (age === undefined || !Number.isInteger(age) || age < 0 || age > 150) {
    errors.push("年齢は0〜150の整数で入力してください");
  }

  // ✅ URL: http/https のみ許可
  if (website) {
    try {
      const url = new URL(website);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.push("URLはhttp://またはhttps://で始まる必要があります");
      }
    } catch {
      errors.push("有効なURLを入力してください");
    }
  }

  if (errors.length > 0) {
    return c.json({ success: false, errors }, 400);
  }

  return c.json({
    success: true,
    message: "登録が完了しました",
    user: { username, email, age, website },
  });
});

export default app;
