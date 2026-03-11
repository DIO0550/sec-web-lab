// インメモリセッションストア（学習目的）
export const sessions = new Map<string, { userId: number; username: string }>();

// デモ用の簡易認証
export function authenticate(username: string, password: string): { id: number; username: string } | null {
  const validUsers: Record<string, { id: number; password: string }> = {
    alice: { id: 1, password: "alice123" },
    admin: { id: 2, password: "admin123" },
    user1: { id: 3, password: "password1" },
  };
  const user = validUsers[username];
  if (!user || user.password !== password) return null;
  return { id: user.id, username };
}
