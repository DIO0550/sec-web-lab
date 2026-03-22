import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: X-Forwarded-For Trust (プロキシヘッダ信頼ミスによるレート制限回避)
// X-Forwarded-Forの先頭値を無条件に信頼することでレート制限を回避される脆弱性
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
