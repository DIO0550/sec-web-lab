// ========================================
// Lab: IDOR (Insecure Direct Object Reference)
// IDを書き換えるだけで他人のデータが見える
// ========================================

// インメモリセッション管理（デモ用）
export const sessions = new Map<string, { id: number; username: string; role: string }>();

// セッションIDの生成（デモ用の簡易実装）
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
