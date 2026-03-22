import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// インメモリでユーザーデータを保存
type User = { username: string; role: string; registeredAt: string };
const users: User[] = [];

// ⚠️ HPP: バリデーションと実行で異なるパラメータ抽出方法を使用
// c.req.query('role') は最初の値を返すが、
// URLSearchParams.getAll() の最後の値で実際の登録処理を行う
app.post("/register", async (c) => {
  const body = await c.req.json<{ username: string; role: string }>();
  const { username } = body;

  if (!username) {
    return c.json(
      { success: false, message: "ユーザー名を入力してください" },
      400
    );
  }

  // ⚠️ バリデーション: c.req.query() は最初の値を返す
  // ?role=user&role=admin の場合、ここでは 'user' が返される
  const role = c.req.query("role") ?? body.role;

  if (role !== "user" && role !== "editor") {
    return c.json(
      {
        success: false,
        message: `不正なロールです: ${role}`,
      },
      403
    );
  }

  // ⚠️ 実行: URLの全パラメータを取得し、最後の値を使用
  // ?role=user&role=admin の場合、最後の 'admin' が使われる
  const url = new URL(c.req.url);
  const allRoles = url.searchParams.getAll("role");
  const effectiveRole =
    allRoles.length > 0 ? allRoles[allRoles.length - 1] : role;

  users.push({
    username,
    role: effectiveRole,
    registeredAt: new Date().toISOString(),
  });

  return c.json({
    success: true,
    message: `ユーザー「${username}」を ${effectiveRole} として登録しました`,
    user: { username, role: effectiveRole },
    _debug: {
      validatedRole: role,
      effectiveRole,
      allRolesInQuery: allRoles,
      warning:
        allRoles.length > 1
          ? "重複パラメータが検出されましたが、最後の値で登録されました"
          : undefined,
    },
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
