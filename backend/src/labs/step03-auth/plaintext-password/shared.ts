import { getPool } from "../../../db/pool.js";
import bcrypt from "bcryptjs";

// bcryptハッシュのキャッシュ（デモ用。実際のアプリではDBにハッシュを保存する）
export const hashedPasswords = new Map<string, string>();

// 起動時にデモ用のハッシュを生成
export async function initHashes() {
  const pool = getPool();
  try {
    const result = await pool.query("SELECT username, password FROM users");
    for (const row of result.rows) {
      if (!hashedPasswords.has(row.username)) {
        const hash = await bcrypt.hash(row.password, 12);
        hashedPasswords.set(row.username, hash);
      }
    }
  } catch {
    // DB未接続の場合はスキップ
  }
}
