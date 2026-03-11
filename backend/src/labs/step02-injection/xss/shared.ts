// --- HTMLエスケープ関数 ---
// ✅ HTML特殊文字を文字参照（エンティティ）に変換する
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
