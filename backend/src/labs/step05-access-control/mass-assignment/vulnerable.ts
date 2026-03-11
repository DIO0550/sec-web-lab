import { Hono } from "hono";
import { demoUsers, incrementNextId } from "./shared.js";
import type { DemoUser } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ユーザー登録: リクエストボディの全フィールドをそのまま使用
// 攻撃者が "role": "admin" を追加送信すると、管理者として登録されてしまう
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

  // ⚠️ リクエストボディの全フィールドをそのまま使用
  // body に "role": "admin" が含まれていると、そのまま保存される
  const user: DemoUser = {
    id: incrementNextId(),
    username: body.username,
    email: body.email,
    password: body.password,
    role: body.role || "user", // ⚠️ body.role が指定されていればそれを使用してしまう
  };

  demoUsers.push(user);

  return c.json({
    success: true,
    message: "ユーザーを登録しました",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    _debug: {
      message: "フィールドフィルタリングなし: リクエストボディの全フィールドをそのまま保存しています",
      receivedFields: Object.keys(body),
      roleSource: body.role ? "クライアントが指定した値" : "デフォルト値 'user'",
    },
  });
});

// ⚠️ プロフィール更新: リクエストボディの全フィールドでDB更新
app.put("/users/:id", async (c) => {
  const targetId = Number(c.req.param("id"));
  const body = await c.req.json();

  const userIndex = demoUsers.findIndex((u) => u.id === targetId);
  if (userIndex === -1) {
    return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
  }

  // ⚠️ リクエストボディの全フィールドでそのまま上書き
  // "role": "admin" を含むリクエストで権限を変更できる
  const updatedUser = { ...demoUsers[userIndex], ...body, id: targetId };
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
    _debug: {
      message: "フィールドフィルタリングなし: リクエストの全フィールドで上書きしています",
      receivedFields: Object.keys(body),
    },
  });
});

export default app;
