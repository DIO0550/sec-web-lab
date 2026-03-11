import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: XXE (XML External Entity)
// XML外部エンティティによるファイル読み取り
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
