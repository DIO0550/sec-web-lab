import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Sensitive File Exposure
// 機密ファイルの露出 (.env / .git / robots.txt)
// ========================================

// テスト用のダミー機密ファイルの内容
const DUMMY_ENV = `# ⚠️ これはデモ用のダミーファイルです
DB_HOST=db.internal.example.com
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=super_secret_password_123
API_KEY=sk-live-abcdef1234567890
JWT_SECRET=my-super-secret-jwt-key
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
`;

const DUMMY_GIT_HEAD = `ref: refs/heads/main
`;

const DUMMY_GIT_CONFIG = `[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
[remote "origin"]
\turl = https://github.com/example-corp/internal-app.git
\tfetch = +refs/heads/*:refs/remotes/origin/*
[user]
\temail = developer@example-corp.com
`;

const DUMMY_ROBOTS_TXT = `User-agent: *
Disallow: /admin/
Disallow: /api/internal/
Disallow: /backup/
Disallow: /config/
# 管理画面とバックアップディレクトリを検索エンジンから隠す
`;

// --- 脆弱バージョン ---
// ⚠️ ドットファイルや機密ファイルへのアクセスをフィルタリングしていない
// 静的ファイルとして .env, .git/, robots.txt がそのまま返却される

app.get("/vulnerable/.env", (c) => {
  // .env ファイルの内容がそのまま返される（脆弱）
  return c.text(DUMMY_ENV);
});

app.get("/vulnerable/.git/HEAD", (c) => {
  // .git/HEAD がそのまま返される（脆弱）
  return c.text(DUMMY_GIT_HEAD);
});

app.get("/vulnerable/.git/config", (c) => {
  // .git/config がそのまま返される（脆弱）
  // リモートURL やユーザー情報が漏洩する
  return c.text(DUMMY_GIT_CONFIG);
});

app.get("/vulnerable/robots.txt", (c) => {
  // robots.txt が返される（脆弱）
  // Disallow ディレクティブから管理画面のパスが判明する
  return c.text(DUMMY_ROBOTS_TXT);
});

// 脆弱バージョンのインデックス
app.get("/vulnerable/", (c) => {
  return c.json({
    message: "これは脆弱なエンドポイントです",
    hint: "以下のパスにアクセスして機密ファイルを取得してみてください",
    paths: [
      "/api/labs/sensitive-file-exposure/vulnerable/.env",
      "/api/labs/sensitive-file-exposure/vulnerable/.git/HEAD",
      "/api/labs/sensitive-file-exposure/vulnerable/.git/config",
      "/api/labs/sensitive-file-exposure/vulnerable/robots.txt",
    ],
  });
});

// --- 安全バージョン ---
// ✅ ドットファイルへのアクセスをミドルウェアで一律拒否する
// リクエストパスに "/." が含まれていれば、ファイルの存在を確認する前に拒否する

app.use("/secure/*", async (c, next) => {
  const url = new URL(c.req.url);
  const path = url.pathname;
  // "/secure/" 以降のパス部分を取得
  const securePath = path.split("/secure/")[1] ?? "";

  // ドットファイルへのアクセスを拒否
  if (securePath.startsWith(".") || securePath.includes("/.")) {
    return c.json(
      { error: "Forbidden", message: "ドットファイルへのアクセスは禁止されています" },
      403
    );
  }
  await next();
});

// 安全バージョンのインデックス
app.get("/secure/", (c) => {
  return c.json({
    message: "これは安全なエンドポイントです",
    hint: "ドットファイルへのアクセスを試してみてください。403 Forbidden が返されます",
    paths: [
      "/api/labs/sensitive-file-exposure/secure/.env",
      "/api/labs/sensitive-file-exposure/secure/.git/HEAD",
      "/api/labs/sensitive-file-exposure/secure/.git/config",
    ],
  });
});

// 安全バージョンでもルートは定義されているが、ミドルウェアで弾かれる
app.get("/secure/.env", (c) => {
  return c.text(DUMMY_ENV);
});

app.get("/secure/.git/HEAD", (c) => {
  return c.text(DUMMY_GIT_HEAD);
});

app.get("/secure/.git/config", (c) => {
  return c.text(DUMMY_GIT_CONFIG);
});

// robots.txt はドットファイルではないが、安全版では情報を制限して返す
app.get("/secure/robots.txt", (c) => {
  // ✅ 安全版では管理画面のパスなどを含めない
  return c.text(`User-agent: *
Disallow:
`);
});

export default app;
