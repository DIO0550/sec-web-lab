import { Hono } from "hono";
import { users } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ app.all() で全HTTPメソッドを許可
// PUT/DELETE/TRACE 等の不要メソッドが受け付けられる
app.all("/users/:id", async (c) => {
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

export default app;
