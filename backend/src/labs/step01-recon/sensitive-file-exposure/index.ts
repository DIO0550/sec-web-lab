import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Sensitive File Exposure
// 機密ファイルの露出 (.env / .git / robots.txt)
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
