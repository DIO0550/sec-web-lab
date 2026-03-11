// 認証サービスのシミュレーション（時々エラーを返す）
export let authServiceDown = false;

export function setAuthServiceDown(value: boolean) {
  authServiceDown = value;
}

export function simulateAuthService(token: string): { valid: boolean; role: string } | null {
  if (authServiceDown) {
    throw new Error("Authentication service unavailable");
  }
  if (token === "valid-admin-token") return { valid: true, role: "admin" };
  if (token === "valid-user-token") return { valid: true, role: "user" };
  return null;
}
