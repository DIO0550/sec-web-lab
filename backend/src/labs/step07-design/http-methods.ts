import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Unnecessary HTTP Methods
// 不要なHTTPメソッドが許可されている
// ========================================

// デモ用ユーザーデータ
const users = new Map<string, { name: string; email: string; role: string }>([
  ["1", { name: "admin", email: "admin@example.com", role: "admin" }],
  ["2", { name: "user1", email: "user1@example.com", role: "user" }],
]);

// --- 脆弱バージョン ---

// ⚠️ app.all() で全HTTPメソッドを許可
// PUT/DELETE/TRACE 等の不要メソッドが受け付けられる
app.all("/vulnerable/users/:id", async (c) => {
  const id = c.req.param("id");
  const method = c.req.method;

  // ⚠️ 認証・認可チェックなし
  switch (method) {
    case "GET": {
      const user = users.get(id);
      if (!user) return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
      return c.json({ success: true, user, _debug: { message: "全HTTPメソッドが許可されています" } });
    }
    case "PUT": {
      // ⚠️ 認証なしでユーザー情報を更新できる
      const body = await c.req.json();
      const user = users.get(id);
      if (!user) return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
      Object.assign(user, body);
      return c.json({
        success: true,
        message: "ユーザー情報を更新しました",
        user,
        _debug: { message: "認証なしでPUTリクエストが実行できました" },
      });
    }
    case "DELETE": {
      // ⚠️ 認証なしでユーザーを削除できる
      const deleted = users.delete(id);
      return c.json({
        success: deleted,
        message: deleted ? "ユーザーを削除しました" : "ユーザーが見つかりません",
        _debug: { message: "認証なしでDELETEリクエストが実行できました" },
      });
    }
    case "TRACE": {
      // ⚠️ TRACEメソッドでリクエストヘッダーが返される
      const headers: Record<string, string> = {};
      c.req.raw.headers.forEach((v, k) => { headers[k] = v; });
      return c.json({
        success: true,
        method: "TRACE",
        headers,
        _debug: { message: "TRACEメソッドでリクエストヘッダーが露出しています" },
      });
    }
    default:
      return c.json({ success: true, method, message: `${method} メソッドが受け付けられました` });
  }
});

// --- 安全バージョン ---

// ✅ 必要なメソッドのみ定義
app.get("/secure/users/:id", (c) => {
  const id = c.req.param("id");
  const user = users.get(id);
  if (!user) return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
  return c.json({ success: true, user });
});

// ✅ PUT/DELETEは明示的に405を返す
app.put("/secure/users/:id", (c) => {
  return c.json({ success: false, message: "このメソッドは許可されていません" }, 405);
});

app.delete("/secure/users/:id", (c) => {
  return c.json({ success: false, message: "このメソッドは許可されていません" }, 405);
});

// リセット
app.post("/reset", (c) => {
  users.set("1", { name: "admin", email: "admin@example.com", role: "admin" });
  users.set("2", { name: "user1", email: "user1@example.com", role: "user" });
  return c.json({ message: "リセットしました" });
});

export default app;
