import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

// ========================================
// Lab: Cross-Site Scripting (XSS)
// ユーザー入力がHTMLとして解釈される脆弱性
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
