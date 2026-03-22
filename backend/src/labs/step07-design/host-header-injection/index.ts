import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Host Header Injection (Hostヘッダ汚染によるリンク詐称)
// Hostヘッダを信頼してパスワードリセットリンクを生成する脆弱性
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
