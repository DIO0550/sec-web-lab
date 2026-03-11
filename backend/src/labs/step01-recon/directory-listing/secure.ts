import { Hono } from "hono";
import { DUMMY_FILES, DUMMY_FILE_CONTENTS } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---
// ✅ ディレクトリ一覧表示を無効化し、ディレクトリアクセスを拒否する

// ディレクトリアクセスを 403 で拒否
app.get("/static/", (c) => {
  // ✅ ディレクトリ一覧の代わりに 403 Forbidden を返す
  // ファイルの存在を推測させない
  return c.json(
    { error: "Forbidden", message: "ディレクトリ一覧の表示は無効です" },
    403
  );
});

// 個別ファイルへのアクセスは許可するが、機密ファイルはフィルタリング
app.get("/static/:filename", (c) => {
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
app.get("/", (c) => {
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
