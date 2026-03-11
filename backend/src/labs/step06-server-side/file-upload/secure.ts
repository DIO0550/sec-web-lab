import { Hono } from "hono";
import { uploadedFiles, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ 拡張子ホワイトリスト + MIMEタイプ検証 + ファイル名サニタイズ
app.post("/upload", async (c) => {
  const body = await c.req.json<{ fileName: string; content: string; mimeType: string }>();
  const { fileName, content, mimeType } = body;

  if (!fileName || !content) {
    return c.json({ success: false, message: "ファイル名とコンテンツを入力してください" }, 400);
  }

  // ✅ 拡張子チェック（ホワイトリスト方式）
  const ext = fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return c.json({
      success: false,
      message: `許可されていないファイル形式です。許可: ${ALLOWED_EXTENSIONS.join(", ")}`,
    }, 400);
  }

  // ✅ MIMEタイプ検証
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return c.json({
      success: false,
      message: `許可されていないMIMEタイプです: ${mimeType}`,
    }, 400);
  }

  // ✅ ファイル名サニタイズ（パストラバーサル防止）
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  // ✅ ランダムなファイル名に変更（予測不可能にする）
  const id = Math.random().toString(36).substring(2, 10);
  const savedName = `${id}${ext}`;

  // ✅ ファイルサイズ制限
  if (content.length > 1024 * 1024) {
    return c.json({
      success: false,
      message: "ファイルサイズが上限(1MB)を超えています",
    }, 400);
  }

  const entry = {
    id,
    originalName: sanitizedName,
    savedName,
    size: content.length,
    mimeType,
    mode: "secure" as const,
  };
  uploadedFiles.push(entry);

  return c.json({
    success: true,
    message: `ファイルを安全にアップロードしました`,
    file: entry,
  });
});

export default app;
