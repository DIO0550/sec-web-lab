import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: File Upload (ファイルアップロード攻撃)
// ファイルアップロード検証不備によるWebシェル実行
// ========================================

// アップロード済みファイルのシミュレーション用ストレージ
const uploadedFiles: Array<{
  id: string;
  originalName: string;
  savedName: string;
  size: number;
  mimeType: string;
  mode: "vulnerable" | "secure";
}> = [];

// --- 脆弱バージョン ---

// ⚠️ ファイル名・拡張子・MIMEタイプの検証なし
// 実行可能ファイル (.php, .js, .sh 等) もアップロード可能
app.post("/vulnerable/upload", async (c) => {
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

// --- 安全バージョン ---

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".txt"];
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif",
  "application/pdf", "text/plain",
];

// ✅ 拡張子ホワイトリスト + MIMEタイプ検証 + ファイル名サニタイズ
app.post("/secure/upload", async (c) => {
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
