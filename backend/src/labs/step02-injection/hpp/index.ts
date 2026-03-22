import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

// ========================================
// Lab: HTTP Parameter Pollution (HPP)
// 同じパラメータの重複で検証をすり抜ける
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
