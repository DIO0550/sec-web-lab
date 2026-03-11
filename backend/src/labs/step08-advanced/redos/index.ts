import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: ReDoS (Regular Expression Denial of Service)
// 危険な正規表現パターンによるCPUリソース枯渇
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
