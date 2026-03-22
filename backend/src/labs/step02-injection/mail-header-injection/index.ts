import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

// ========================================
// Lab: Mail Header Injection
// メールヘッダーに改行コードを注入してスパムの踏み台にする
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
