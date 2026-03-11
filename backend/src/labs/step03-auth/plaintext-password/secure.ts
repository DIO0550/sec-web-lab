import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";
import bcrypt from "bcryptjs";
import { hashedPasswords, initHashes } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ユーザー一覧: パスワードをbcryptハッシュで表示
// DBが漏洩してもパスワードは復元できない
app.get("/users", async (c) => {
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
app.post("/login", async (c) => {
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
