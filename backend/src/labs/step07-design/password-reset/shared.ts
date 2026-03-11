// 脆弱版: 連番カウンター（オブジェクトで参照共有）
export const vulnState = { counter: 0 };

// 脆弱版: トークン保存
export const vulnTokens = new Map<string, { email: string; createdAt: number }>();

// 安全版: トークン保存
export const secureTokens = new Map<string, { email: string; createdAt: number; used: boolean }>();

// 安全版: トークン有効期限
export const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30分
