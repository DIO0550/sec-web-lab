import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { vulnState, vulnTokens, secureTokens } from "./shared.js";

// ========================================
// Lab: Password Reset Token
// パスワードリセットトークンが推測可能
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// リセット
app.post("/reset", (c) => {
  vulnState.counter = 0;
  vulnTokens.clear();
  secureTokens.clear();
  return c.json({ message: "リセットしました" });
});

export default app;
