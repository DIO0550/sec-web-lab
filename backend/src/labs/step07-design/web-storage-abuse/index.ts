import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

// ========================================
// Lab: Web Storage Abuse
// localStorage/sessionStorage への機密データ保存
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
