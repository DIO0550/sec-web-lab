import { Hono } from "hono";
import { DUMMY_ENV, DUMMY_GIT_HEAD, DUMMY_GIT_CONFIG } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---
// ✅ ドットファイルへのアクセスをミドルウェアで一律拒否する
// リクエストパスに "/." が含まれていれば、ファイルの存在を確認する前に拒否する

app.use("/*", async (c, next) => {
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
app.get("/", (c) => {
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
app.get("/.env", (c) => {
  return c.text(DUMMY_ENV);
});

app.get("/.git/HEAD", (c) => {
  return c.text(DUMMY_GIT_HEAD);
});

app.get("/.git/config", (c) => {
  return c.text(DUMMY_GIT_CONFIG);
});

// robots.txt はドットファイルではないが、安全版では情報を制限して返す
app.get("/robots.txt", (c) => {
  // ✅ 安全版では管理画面のパスなどを含めない
  return c.text(`User-agent: *
Disallow:
`);
});

export default app;
