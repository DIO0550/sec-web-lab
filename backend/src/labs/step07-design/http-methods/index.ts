import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { users } from "./shared.js";

// ========================================
// Lab: Unnecessary HTTP Methods
// 不要なHTTPメソッドが許可されている
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// リセット
app.post("/reset", (c) => {
  users.set("1", { name: "admin", email: "admin@example.com", role: "admin" });
  users.set("2", { name: "user1", email: "user1@example.com", role: "user" });
  return c.json({ message: "リセットしました" });
});

export default app;
