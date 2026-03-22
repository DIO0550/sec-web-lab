import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: SSRF Bypass (SSRFフィルタの回避テクニック)
// ブロックリストの文字列一致チェックをIPアドレス代替表現で回避する
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
