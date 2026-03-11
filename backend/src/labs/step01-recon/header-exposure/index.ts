import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Security Header Misconfiguration
// セキュリティヘッダーの欠如による脆弱性
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
