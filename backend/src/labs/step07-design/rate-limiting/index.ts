import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { loginAttempts, vulnState } from "./shared.js";

// ========================================
// Lab: Rate Limiting (レート制限なし)
// APIにレート制限がなくブルートフォース攻撃が可能
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// リセット
app.post("/reset", (c) => {
  loginAttempts.clear();
  vulnState.attemptCount = 0;
  return c.json({ message: "リセットしました" });
});

export default app;
