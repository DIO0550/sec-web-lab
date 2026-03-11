import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { sessions, resetComments, resetCommentIdCounter } from "./shared.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// デモ用: コメントリセット
app.post("/reset", (c) => {
  resetComments();
  resetCommentIdCounter();
  sessions.clear();
  return c.json({ success: true, message: "コメントとセッションをリセットしました" });
});

export default app;
