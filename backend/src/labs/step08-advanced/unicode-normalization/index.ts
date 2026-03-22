import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Unicode Normalization Bypass (Unicode正規化によるフィルタ回避)
// フィルタの後にNFKC正規化を行うことで全角文字がフィルタを通過する脆弱性
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
