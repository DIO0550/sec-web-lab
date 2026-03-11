import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { sessions } from "./shared.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// デモ用: セッションリセット
app.post("/reset", (c) => {
  sessions.clear();
  return c.json({ success: true, message: "全セッションをリセットしました" });
});

export default app;
