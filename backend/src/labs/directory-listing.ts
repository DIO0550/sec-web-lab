import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Directory Listing
// ディレクトリリスティングによる情報漏洩
// ========================================

// ダミーのファイル一覧データ（実際のファイルシステムの代わりにシミュレート）
const DUMMY_FILES = [
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
const DUMMY_FILE_CONTENTS: Record<string, string> = {
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

// --- 脆弱バージョン ---
// ⚠️ ディレクトリ一覧表示が有効 — ファイル構成が丸見え

// ディレクトリ一覧を HTML で返す（脆弱）
app.get("/vulnerable/static/", (c) => {
  // ⚠️ ディレクトリ内のファイル一覧をHTMLとして返す
  // バックアップファイルや設定ファイルの存在が攻撃者に判明する
  const html = `<!DOCTYPE html>
<html>
<head><title>Index of /static/</title></head>
<body>
<h1>Index of /static/</h1>
<hr>
<pre>
Name                    Size     Last Modified
----------------------------------------------
${DUMMY_FILES.map(
  (f) =>
    `<a href="${f.name}">${f.name.padEnd(24)}</a>${f.size.padEnd(9)}${f.modified}`
).join("\n")}
</pre>
<hr>
</body>
</html>`;

  return c.html(html);
});

// ダミーファイルの中身を返す
app.get("/vulnerable/static/:filename", (c) => {
  const filename = c.req.param("filename");
  const content = DUMMY_FILE_CONTENTS[filename];
  if (content) {
    return c.text(content);
  }
  // 一覧に存在するが中身を用意していないファイル
  const file = DUMMY_FILES.find((f) => f.name === filename);
  if (file) {
    return c.text(`[ダミーファイル: ${filename}]`);
  }
  return c.text("Not Found", 404);
});

// 脆弱バージョンのインデックス
app.get("/vulnerable/", (c) => {
  return c.json({
    message: "これは脆弱なエンドポイントです",
    hint: "ディレクトリにアクセスしてファイル一覧を取得してみてください",
    paths: [
      "/api/labs/directory-listing/vulnerable/static/",
    ],
  });
});

// --- 安全バージョン ---
// ✅ ディレクトリ一覧表示を無効化し、ディレクトリアクセスを拒否する

// ディレクトリアクセスを 403 で拒否
app.get("/secure/static/", (c) => {
  // ✅ ディレクトリ一覧の代わりに 403 Forbidden を返す
  // ファイルの存在を推測させない
  return c.json(
    { error: "Forbidden", message: "ディレクトリ一覧の表示は無効です" },
    403
  );
});

// 個別ファイルへのアクセスは許可するが、機密ファイルはフィルタリング
app.get("/secure/static/:filename", (c) => {
  const filename = c.req.param("filename");

  // ✅ ドットファイルへのアクセスを拒否
  if (filename.startsWith(".")) {
    return c.json(
      { error: "Forbidden", message: "ドットファイルへのアクセスは禁止されています" },
      403
    );
  }

  // ✅ バックアップファイルへのアクセスを拒否
  if (filename.endsWith(".bak") || filename.endsWith(".sql") || filename.endsWith(".backup")) {
    return c.json(
      { error: "Forbidden", message: "バックアップファイルへのアクセスは禁止されています" },
      403
    );
  }

  const content = DUMMY_FILE_CONTENTS[filename];
  if (content) {
    return c.text(content);
  }
  const file = DUMMY_FILES.find((f) => f.name === filename);
  if (file) {
    return c.text(`[ファイル: ${filename}]`);
  }
  return c.text("Not Found", 404);
});

// 安全バージョンのインデックス
app.get("/secure/", (c) => {
  return c.json({
    message: "これは安全なエンドポイントです",
    hint: "ディレクトリ一覧は表示されず、機密ファイルへのアクセスも拒否されます",
    paths: [
      "/api/labs/directory-listing/secure/static/",
      "/api/labs/directory-listing/secure/static/config.bak",
      "/api/labs/directory-listing/secure/static/.htpasswd",
    ],
  });
});

export default app;
