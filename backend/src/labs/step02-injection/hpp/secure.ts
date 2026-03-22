import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// インメモリでユーザーデータを保存
type User = { username: string; role: string; registeredAt: string };
const users: User[] = [];

// ✅ HPP対策: ボディのroleのみ受け付け、クエリパラメータの重複を検出して拒否
app.post("/register", async (c) => {
  const body = await c.req.json<{ username: string; role: string }>();
  const { username, role } = body;

  if (!username) {
    return c.json(
      { success: false, message: "ユーザー名を入力してください" },
      400
    );
  }

  if (!role) {
    return c.json(
      { success: false, message: "ロールを指定してください" },
      400
    );
  }

  // ✅ 重複パラメータの検出: クエリパラメータにroleが含まれている場合は拒否
  const url = new URL(c.req.url);
  const queryRoles = url.searchParams.getAll("role");
  if (queryRoles.length > 0) {
    return c.json(
      {
        success: false,
        message:
          "クエリパラメータでのrole指定は許可されていません。リクエストボディで指定してください。",
        _debug: {
          detectedQueryRoles: queryRoles,
          info: "重複パラメータ攻撃を防止するため、roleはボディからのみ受け付けます",
        },
      },
      400
    );
  }

  // ✅ 許可リストによるバリデーション
  const allowedRoles = ["user", "editor"];
  if (!allowedRoles.includes(role)) {
    return c.json(
      {
        success: false,
        message: `不正なロールです: ${role}。許可されたロール: ${allowedRoles.join(", ")}`,
      },
      403
    );
  }

  // ✅ バリデーション済みの同一変数を使って登録
  users.push({
    username,
    role,
    registeredAt: new Date().toISOString(),
  });

  return c.json({
    success: true,
    message: `ユーザー「${username}」を ${role} として登録しました`,
    user: { username, role },
  });
});

// ユーザー一覧
app.get("/users", (c) => {
  return c.json({
    success: true,
    users,
    count: users.length,
  });
});

export default app;
