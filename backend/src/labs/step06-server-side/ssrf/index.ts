import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: SSRF (Server-Side Request Forgery)
// サーバーを踏み台にした内部ネットワークへの不正アクセス
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
