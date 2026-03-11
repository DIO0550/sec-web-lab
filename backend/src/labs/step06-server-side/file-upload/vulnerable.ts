import { Hono } from "hono";
import { uploadedFiles } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ファイル名・拡張子・MIMEタイプの検証なし
// 実行可能ファイル (.php, .js, .sh 等) もアップロード可能
app.post("/upload", async (c) => {
  const body = await c.req.json<{ fileName: string; content: string; mimeType: string }>();
  const { fileName, content, mimeType } = body;

  if (!fileName || !content) {
    return c.json({ success: false, message: "ファイル名とコンテンツを入力してください" }, 400);
  }

  // ⚠️ ファイル名をそのまま使用（パストラバーサルも可能）
  // ⚠️ 拡張子チェックなし — .php, .jsp, .sh 等もアップロード可能
  // ⚠️ MIMEタイプ検証なし
  // ⚠️ ファイル内容のスキャンなし
  const id = Math.random().toString(36).substring(2, 10);
  const entry = {
    id,
    originalName: fileName,
    savedName: fileName, // ⚠️ オリジナルのファイル名をそのまま使用
    size: content.length,
    mimeType: mimeType || "application/octet-stream",
    mode: "vulnerable" as const,
  };
  uploadedFiles.push(entry);

  return c.json({
    success: true,
    message: `ファイル "${fileName}" をアップロードしました`,
    file: entry,
    _debug: {
      message: "検証なし: ファイル名・拡張子・MIMEタイプ・コンテンツの検証を行っていません",
      risks: [
        "実行可能ファイル(.php, .sh等)のアップロード",
        "パストラバーサル (../../etc/cron.d/backdoor)",
        "MIMEタイプ偽装",
      ],
    },
  });
});

export default app;
