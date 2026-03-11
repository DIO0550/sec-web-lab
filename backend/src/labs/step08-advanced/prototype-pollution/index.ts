import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Prototype Pollution
// Object.assign()等によるプロトタイプ汚染
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// リセット（プロトタイプの汚染を解除）
app.post("/reset", (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (Object.prototype as any).isAdmin;
  return c.json({ message: "リセットしました" });
});

export default app;
