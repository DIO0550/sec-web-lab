import { Hono } from "hono";
import { sessions } from "./shared.js";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// セッションリセット（デモ用）
app.post("/reset", (c) => {
  sessions.clear();
  return c.json({ message: "セッションをリセットしました" });
});

export default app;
