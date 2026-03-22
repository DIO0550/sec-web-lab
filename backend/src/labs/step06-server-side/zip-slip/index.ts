import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Zip Slip (ZIP展開によるパストラバーサル)
// ZIPエントリのファイル名に含まれる ../  を検証せずに展開先パスを構築する脆弱性
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
