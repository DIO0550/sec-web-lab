// アップロード済みファイルのシミュレーション用ストレージ
export const uploadedFiles: Array<{
  id: string;
  originalName: string;
  savedName: string;
  size: number;
  mimeType: string;
  mode: "vulnerable" | "secure";
}> = [];

// 安全バージョンで使用する許可リスト
export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".txt"];
export const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif",
  "application/pdf", "text/plain",
];
