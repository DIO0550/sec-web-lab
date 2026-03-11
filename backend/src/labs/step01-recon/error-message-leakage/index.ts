import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Error Message Leakage
// エラーメッセージからの情報漏洩
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
