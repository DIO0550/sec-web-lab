import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { uploadedFiles } from "./shared.js";

const app = new Hono();

// ========================================
// Lab: File Upload (ファイルアップロード攻撃)
// ファイルアップロード検証不備によるWebシェル実行
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// アップロード一覧
app.get("/files", (c) => {
  return c.json({ files: uploadedFiles });
});

// リセット
app.post("/reset", (c) => {
  uploadedFiles.length = 0;
  return c.json({ message: "アップロード一覧をリセットしました" });
});

export default app;
