// ダミーのファイル一覧データ（実際のファイルシステムの代わりにシミュレート）
export const DUMMY_FILES = [
  { name: "index.html", size: "2.1K", modified: "2024-01-20 10:30" },
  { name: "style.css", size: "4.5K", modified: "2024-01-19 14:22" },
  { name: "app.js", size: "12K", modified: "2024-01-20 09:15" },
  { name: "config.bak", size: "1.2K", modified: "2024-01-15 08:00" },
  { name: "database.sql", size: "45M", modified: "2024-01-10 03:00" },
  { name: ".htpasswd", size: "256", modified: "2024-01-01 00:00" },
  { name: ".env.backup", size: "512", modified: "2024-01-05 12:00" },
  { name: "upload/", size: "-", modified: "2024-01-20 11:00" },
  { name: "backup/", size: "-", modified: "2024-01-18 02:00" },
];

// ダミーファイルの中身
export const DUMMY_FILE_CONTENTS: Record<string, string> = {
  "config.bak": `# バックアップ設定ファイル
DB_HOST=db.internal.example.com
DB_PASSWORD=backup_secret_123
ADMIN_EMAIL=admin@example-corp.com
`,
  "database.sql": `-- データベースダンプ (抜粋)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  password VARCHAR(255), -- 平文パスワード
  email VARCHAR(255)
);
INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin@example.com');
`,
  ".htpasswd": `admin:$apr1$xyz$hashedpassword123
developer:$apr1$abc$anotherhashedpass456
`,
};
