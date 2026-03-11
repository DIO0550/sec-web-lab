import path from "node:path";

// ========================================
// Lab: Path Traversal
// ../ でサーバーの秘密ファイルを読み取る
// ========================================

// アップロードディレクトリのベースパス
export const BASE_DIR = path.resolve(process.cwd(), "uploads");
