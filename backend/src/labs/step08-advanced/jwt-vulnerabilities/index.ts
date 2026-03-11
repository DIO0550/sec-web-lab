import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: JWT Vulnerabilities
// JWT署名検証不備による認証バイパス
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
