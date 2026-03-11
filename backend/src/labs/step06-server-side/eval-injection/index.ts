import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";

const app = new Hono();

// ========================================
// Lab: Eval Injection
// ユーザー入力をコードとして実行してしまう
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

export default app;
