import { getPool } from "./pool.js";

async function seed() {
  const pool = getPool();

  console.log("Seeding database...");

  // サンプルユーザーデータ (脆弱性テスト用)
  await pool.query(`
    INSERT INTO users (username, password, email, role)
    VALUES
      ('admin', 'admin123', 'admin@example.com', 'admin'),
      ('user1', 'password1', 'user1@example.com', 'user'),
      ('user2', 'password2', 'user2@example.com', 'user')
    ON CONFLICT (username) DO NOTHING;
  `);

  // サンプル投稿データ
  await pool.query(`
    INSERT INTO posts (user_id, title, content)
    VALUES
      (1, 'Welcome', 'Welcome to sec-web-lab!'),
      (2, 'Hello', 'This is a test post.')
    ON CONFLICT DO NOTHING;
  `);

  console.log("Seeding complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
