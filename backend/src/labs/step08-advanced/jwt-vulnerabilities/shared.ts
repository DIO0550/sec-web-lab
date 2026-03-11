// ========================================
// Lab: JWT Vulnerabilities
// JWT署名検証不備による認証バイパス — 共有ヘルパー
// ========================================

export const SECRET = "super-secret-key-2024";

// 簡易Base64URL エンコード/デコード
export function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64url");
}
export function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString();
}

// 簡易HMAC-SHA256 署名
export async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

// JWT生成
export async function createJwt(payload: Record<string, unknown>, alg: string = "HS256"): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg, typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = alg === "none" ? "" : await hmacSign(`${header}.${body}`, SECRET);
  return `${header}.${body}.${signature}`;
}
