import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 安全バージョン ---

// bcryptハッシュのキャッシュ（デモ用）
const bcryptHashes = new Map<string, string>();

async function initBcryptHashes() {
  const pool = getPool();
  try {
    const result = await pool.query("SELECT username, password FROM users");
    for (const row of result.rows) {
      if (!bcryptHashes.has(row.username)) {
        const hash = await bcrypt.hash(row.password, 12);
        bcryptHashes.set(row.username, hash);
      }
    }
  } catch {
    // DB未接続の場合はスキップ
  }
}

// ✅ ユーザー一覧: bcryptハッシュで保存されたパスワードを表示
app.get("/users", async (c) => {
  const pool = getPool();
  try {
    await initBcryptHashes();
    const result = await pool.query("SELECT id, username, email, role FROM users");

    // ✅ パスワードをbcryptハッシュで表示
    const usersWithBcrypt = result.rows.map((user) => ({
      ...user,
      password: bcryptHashes.get(user.username) ?? "(hashed)",
      hashAlgorithm: "bcrypt (cost=12)",
    }));

    return c.json({
      users: usersWithBcrypt,
      _debug: {
        message: "bcryptはソルト自動生成 + コスト係数で、レインボーテーブルが無効化されます。",
      },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ error: error.message }, 500);
  }
});

// ✅ ハッシュ逆引き: bcryptハッシュはレインボーテーブルで逆引きできない
app.get("/crack", async (c) => {
  const hash = c.req.query("hash") ?? "";

  if (!hash) {
    return c.json({ error: "hash パラメータを指定してください" }, 400);
  }

  // ✅ bcryptハッシュはレインボーテーブルに存在しない
  // ソルトがユーザーごとに異なるため、事前計算が不可能
  return c.json({
    success: false,
    hash,
    message: "bcryptハッシュはレインボーテーブルで逆引きできません",
    _debug: {
      reasons: [
        "ソルトがユーザーごとにランダム生成されるため、同じパスワードでも異なるハッシュ値になる",
        "コスト係数12では1回のハッシュ計算に約250msかかり、全探索のコストが膨大",
        "事前計算済みの対応表が作成不可能（ソルトの組み合わせが無限）",
      ],
    },
  });
});

export default app;
