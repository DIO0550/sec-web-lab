import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { sessions, csrfTokens } from "./shared.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// デモ用: セッション・トークンリセット
app.post("/reset", (c) => {
  sessions.clear();
  csrfTokens.clear();
  return c.json({ success: true, message: "全セッションとCSRFトークンをリセットしました" });
});

export default app;
