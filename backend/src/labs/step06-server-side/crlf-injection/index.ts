import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: CRLF Injection
// HTTPレスポンスヘッダーへの改行コード注入
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
