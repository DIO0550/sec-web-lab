// デモ用ユーザーデータ
export const users: Record<string, { name: string; email: string; role: string }> = {
  "1": { name: "admin", email: "admin@example.com", role: "admin" },
  "2": { name: "user1", email: "user1@example.com", role: "user" },
};

// 安全バージョンで使用する許可オリジンリスト
export const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://example.com",
];
