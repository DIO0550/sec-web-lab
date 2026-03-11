import { Hono } from "hono";
import { users } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 必要なメソッドのみ定義
app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  const user = users.get(id);
  if (!user) return c.json({ success: false, message: "ユーザーが見つかりません" }, 404);
  return c.json({ success: true, user });
});

// ✅ PUT/DELETEは明示的に405を返す
app.put("/users/:id", (c) => {
  return c.json({ success: false, message: "このメソッドは許可されていません" }, 405);
});

app.delete("/users/:id", (c) => {
  return c.json({ success: false, message: "このメソッドは許可されていません" }, 405);
});

export default app;
