// インメモリセッションストア（学習目的）
export const sessions = new Map<string, { userId: number; username: string; password: string; email: string }>();

// CSRFトークンストア（セッションIDに紐づけ）
export const csrfTokens = new Map<string, string>();
