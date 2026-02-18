import { Hono } from "hono";
import { getPool } from "../../db/pool.js";
import bcrypt from "bcryptjs";

const app = new Hono();

// ========================================
// Lab: Plaintext Password Storage
// パスワードを平文で保存する危険性
// ========================================

// --- 脆弱バージョン ---

// ⚠️ ユーザー一覧: パスワードを平文のまま返す
// DBが漏洩した場合と同じ状況をシミュレート
app.get("/vulnerable/users", async (c) => {
  const pool = getPool();
  try {
    // ⚠️ パスワードカラムをそのまま返す — 平文で保存されているため丸見え
    const result = await pool.query(
      "SELECT id, username, password, email, role FROM users"
    );
    return c.json({
      users: result.rows,
      _debug: {
        message: "パスワードが平文で保存されています。DBが漏洩すると全パスワードが即座に悪用可能です。",
      },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ error: error.message }, 500);
  }
});

// ⚠️ ログイン: パスワードを平文で直接比較
app.post("/vulnerable/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    // ⚠️ パスワードを平文で直接比較 — WHERE句でそのまま照合
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    return c.json({
      success: true,
      message: `${result.rows[0].username} としてログインしました`,
      user: result.rows[0],
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ success: false, message: "エラーが発生しました", error: error.message }, 500);
  }
});

// --- 安全バージョン ---

// bcryptハッシュのキャッシュ（デモ用。実際のアプリではDBにハッシュを保存する）
const hashedPasswords = new Map<string, string>();

// 起動時にデモ用のハッシュを生成
async function initHashes() {
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

// ✅ ユーザー一覧: パスワードをbcryptハッシュで表示
// DBが漏洩してもパスワードは復元できない
app.get("/secure/users", async (c) => {
  const pool = getPool();
  try {
    await initHashes();
    const result = await pool.query(
      "SELECT id, username, email, role FROM users"
    );

    // ✅ パスワードをbcryptハッシュに置き換えて返す
    const usersWithHash = result.rows.map((user) => ({
      ...user,
      password: hashedPasswords.get(user.username) ?? "(hashed)",
    }));

    return c.json({
      users: usersWithHash,
      _debug: {
        message: "パスワードはbcryptでハッシュ化されています。漏洩しても元のパスワードは復元できません。",
      },
    });
  } catch (err) {
    const error = err as Error;
    return c.json({ error: error.message }, 500);
  }
});

// ✅ ログイン: bcrypt.compareで安全にパスワードを比較
app.post("/secure/login", async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const { username, password } = body;
  const pool = getPool();

  if (!username || !password) {
    return c.json({ success: false, message: "ユーザー名とパスワードを入力してください" }, 400);
  }

  try {
    await initHashes();

    // ✅ まずユーザーを検索（パスワードはWHERE句に含めない）
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    // ✅ bcrypt.compareでハッシュと入力パスワードを比較
    const storedHash = hashedPasswords.get(username);
    if (!storedHash) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    const match = await bcrypt.compare(password, storedHash);
    if (!match) {
      return c.json({ success: false, message: "ユーザー名またはパスワードが違います" }, 401);
    }

    return c.json({
      success: true,
      message: `${result.rows[0].username} としてログインしました`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Login error:", (err as Error).message);
    return c.json({ success: false, message: "処理中にエラーが発生しました" }, 500);
  }
});

export default app;
