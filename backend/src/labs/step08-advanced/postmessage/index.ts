import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: postMessage Vulnerability
// window.postMessage のオリジン検証不備
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
