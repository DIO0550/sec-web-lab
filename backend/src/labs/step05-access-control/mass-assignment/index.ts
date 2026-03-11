import { Hono } from "hono";
import { demoUsers, resetDemoData } from "./shared.js";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

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
  resetDemoData();
  return c.json({ message: "デモデータをリセットしました" });
});

export default app;
