import { Hono } from "hono";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: Mass Assignment
// リクエストに余計なフィールドを追加して権限を奪う
// ========================================

// デモ用のインメモリユーザーストア（DBを汚さないため）
type DemoUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
};

let nextId = 100;
const demoUsers: DemoUser[] = [];

// --- 脆弱バージョン ---

// ⚠️ ユーザー登録: リクエストボディの全フィールドをそのまま使用
// 攻撃者が "role": "admin" を追加送信すると、管理者として登録されてしまう
app.post("/vulnerable/register", async (c) => {
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
    id: nextId++,
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
app.put("/vulnerable/users/:id", async (c) => {
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

// --- 安全バージョン ---

// ✅ ユーザー登録: ホワイトリスト方式で許可フィールドのみ抽出
app.post("/secure/register", async (c) => {
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
    id: nextId++,
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
app.put("/secure/users/:id", async (c) => {
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

// 登録済みユーザー一覧（学習用）
app.get("/users", (c) => {
  return c.json({
    users: demoUsers.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
    })),
  });
});

// デモデータリセット
app.post("/reset", (c) => {
  demoUsers.length = 0;
  nextId = 100;
  return c.json({ message: "デモデータをリセットしました" });
});

export default app;
