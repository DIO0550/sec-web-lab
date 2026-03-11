import { Hono } from "hono";
import {
  DUMMY_ENV,
  DUMMY_GIT_HEAD,
  DUMMY_GIT_CONFIG,
  DUMMY_ROBOTS_TXT,
} from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---
// ⚠️ ドットファイルや機密ファイルへのアクセスをフィルタリングしていない
// 静的ファイルとして .env, .git/, robots.txt がそのまま返却される

app.get("/.env", (c) => {
  // .env ファイルの内容がそのまま返される（脆弱）
  return c.text(DUMMY_ENV);
});

app.get("/.git/HEAD", (c) => {
  // .git/HEAD がそのまま返される（脆弱）
  return c.text(DUMMY_GIT_HEAD);
});

app.get("/.git/config", (c) => {
  // .git/config がそのまま返される（脆弱）
  // リモートURL やユーザー情報が漏洩する
  return c.text(DUMMY_GIT_CONFIG);
});

app.get("/robots.txt", (c) => {
  // robots.txt が返される（脆弱）
  // Disallow ディレクティブから管理画面のパスが判明する
  return c.text(DUMMY_ROBOTS_TXT);
});

// 脆弱バージョンのインデックス
app.get("/", (c) => {
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

export default app;
