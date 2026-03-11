// デモ用ユーザーデータ
export const USERS: Record<string, string> = {
  admin: "secretpass",
  user1: "password1",
};

// 安全版用: ログイン試行記録
export const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

// 脆弱版: ログイン試行カウンター（オブジェクトで参照共有）
export const vulnState = { attemptCount: 0 };
