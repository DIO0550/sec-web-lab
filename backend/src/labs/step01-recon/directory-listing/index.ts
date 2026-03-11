import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Directory Listing
// ディレクトリリスティングによる情報漏洩
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
