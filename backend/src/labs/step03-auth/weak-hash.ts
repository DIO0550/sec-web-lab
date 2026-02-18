import { Hono } from "hono";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: Weak Hash Algorithm
// MD5/SHA1 でハッシュしても安全ではない理由
// ========================================

// --- レインボーテーブル（デモ用） ---
// よく使われるパスワードのMD5ハッシュを事前計算した対応表
const RAINBOW_TABLE = new Map<string, string>();
const COMMON_PASSWORDS = [
  "admin123", "password", "password1", "123456", "123456789",
  "qwerty", "abc123", "letmein", "welcome", "admin",
  "monkey", "dragon", "master", "login", "princess",
];

// レインボーテーブルを構築
for (const pw of COMMON_PASSWORDS) {
  const md5 = createHash("md5").update(pw).digest("hex");
  RAINBOW_TABLE.set(md5, pw);
}

// --- 脆弱バージョン ---

// ⚠️ ユーザー一覧: MD5ハッシュで保存されたパスワードを表示
app.get("/vulnerable/users", async (c) => {
  const pool = getPool();
  try {
    const result = await pool.query("SELECT id, username, password, email, role FROM users");

    // ⚠️ パスワードをMD5でハッシュ化して返す（一見安全に見えるが…）
    const usersWithMd5 = result.rows.map((user) => ({
      ...user,
      password: createHash("md5").update(user.password).digest("hex"),
      hashAlgorithm: "MD5",
    }));

    return c.json({
      users: usersWithMd5,
      _debug: {
        message: "MD5は高速すぎてソルトもないため、レインボーテーブルで即座に逆引きできます。",
        hint: "crack エンドポイントでハッシュ値を逆引きしてみてください。",
      },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ error: error.message }, 500);
  }
});

// ⚠️ ハッシュ逆引き: レインボーテーブルでMD5ハッシュから元のパスワードを復元
app.get("/vulnerable/crack", async (c) => {
  const hash = c.req.query("hash") ?? "";

  if (!hash) {
    return c.json({ error: "hash パラメータを指定してください" }, 400);
  }

  // ⚠️ レインボーテーブルで逆引き — MD5は事前計算済みの対応表で即座に解読可能
  const cracked = RAINBOW_TABLE.get(hash);

  if (cracked) {
    return c.json({
      success: true,
      hash,
      password: cracked,
      method: "レインボーテーブル（事前計算済みMD5対応表）",
      _debug: {
        message: `MD5ハッシュ "${hash}" → パスワード "${cracked}" が判明しました。`,
        rainbowTableSize: RAINBOW_TABLE.size,
      },
    });
  }

  return c.json({
    success: false,
    hash,
    message: "このハッシュはデモ用レインボーテーブルに含まれていません",
    _debug: {
      hint: "実際のレインボーテーブル（CrackStation等）には数十億のエントリがあります。",
    },
  });
});

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
app.get("/secure/users", async (c) => {
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
app.get("/secure/crack", async (c) => {
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
