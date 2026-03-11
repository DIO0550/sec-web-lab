import { Hono } from "hono";
import { demoUsers, incrementNextId } from "./shared.js";
import type { DemoUser } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ユーザー登録: ホワイトリスト方式で許可フィールドのみ抽出
app.post("/register", async (c) => {
  const body = await c.req.json<{
    username: string;
    email: string;
    password: string;
    role?: string;
  }>();

  if (!body.username || !body.email || !body.password) {
    return c.json({ success: false, message: "username, email, password は必須です" }, 400);
  }

  // ✅ 許可するフィールドのみを明示的に抽出（ホワイトリスト方式）
  // body に "role" が含まれていても無視される
  const username = body.username;
  const email = body.email;
  const password = body.password;

  const user: DemoUser = {
    id: incrementNextId(),
    username,
    email,
    password,
    role: "user", // ✅ role は常にサーバーが設定する — クライアントから受け取らない
  };

  demoUsers.push(user);

  // ✅ レスポンスに受信フィールド情報を含めて、role が無視されたことを示す
  const ignoredFields = Object.keys(body).filter(
    (k) => !["username", "email", "password"].includes(k)
  );

  return c.json({
    success: true,
    message: "ユーザーを登録しました",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    _debug: ignoredFields.length > 0
      ? {
          message: "ホワイトリスト方式: 許可されていないフィールドは無視されました",
          ignoredFields,
        }
      : undefined,
  });
});

// ✅ プロフィール更新: 許可フィールドのみ更新
app.put("/users/:id", async (c) => {
  const targetId = Number(c.req.param("id"));
  const body = await c.req.json();

  const userIndex = demoUsers.findIndex((u) => u.id === targetId);
  if (userIndex === -1) {
    return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
  }

  // ✅ 更新を許可するフィールドをホワイトリストで定義
  const allowedFields = ["username", "email"];
  const updates: Record<string, unknown> = {};
  const ignoredFields: string[] = [];

  for (const key of Object.keys(body)) {
    if (allowedFields.includes(key)) {
      updates[key] = body[key];
    } else {
      ignoredFields.push(key);
    }
  }

  const updatedUser = { ...demoUsers[userIndex], ...updates };
  demoUsers[userIndex] = updatedUser;

  return c.json({
    success: true,
    message: "プロフィールを更新しました",
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    },
    _debug: ignoredFields.length > 0
      ? {
          message: "ホワイトリスト方式: 許可されていないフィールドは無視されました",
          allowedFields,
          ignoredFields,
        }
      : undefined,
  });
});

export default app;
