import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: CORS Misconfiguration
// オリジン間リソース共有の設定不備
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
