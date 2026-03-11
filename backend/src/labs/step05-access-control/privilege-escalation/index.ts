import { Hono } from "hono";
import { sessions, resetSystemSettings } from "./shared.js";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// セッション・設定リセット（デモ用）
app.post("/reset", (c) => {
  sessions.clear();
  resetSystemSettings();
  return c.json({ message: "セッションと設定をリセットしました" });
});

export default app;
