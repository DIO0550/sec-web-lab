import { Hono } from "hono";
import { logEntries } from "./shared.js";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// ログ閲覧
app.get("/logs", (c) => {
  return c.json({ logs: logEntries });
});

// リセット
app.post("/reset", (c) => {
  logEntries.length = 0;
  return c.json({ message: "ログをクリアしました" });
});

export default app;
