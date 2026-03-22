import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

// ========================================
// Lab: CSV Injection (Formula Injection)
// エクスポート機能を通じた攻撃コードの埋め込み
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
