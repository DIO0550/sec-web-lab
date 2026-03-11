import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Insecure Deserialization
// 安全でないデシリアライゼーション
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
