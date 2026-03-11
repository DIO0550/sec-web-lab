// ========================================
// Lab: Privilege Escalation
// 一般ユーザーが管理者の操作を実行する
// ========================================

// インメモリセッション管理（デモ用）
export const sessions = new Map<string, { id: number; username: string; role: string }>();

// システム設定（デモ用）
export let systemSettings = {
  maintenance_mode: false,
  allow_registration: true,
  max_upload_size: "10MB",
};

export function resetSystemSettings(): void {
  systemSettings = {
    maintenance_mode: false,
    allow_registration: true,
    max_upload_size: "10MB",
  };
}

export function updateSystemSettings(updates: Record<string, unknown>): void {
  systemSettings = { ...systemSettings, ...updates };
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
