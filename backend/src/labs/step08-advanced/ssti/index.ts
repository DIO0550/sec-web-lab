import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: SSTI (Server-Side Template Injection)
// テンプレートエンジンでユーザー入力が実行される
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
