import { Hono } from "hono";
import { DUMMY_FILES, DUMMY_FILE_CONTENTS } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---
// ⚠️ ディレクトリ一覧表示が有効 — ファイル構成が丸見え

// ディレクトリ一覧を HTML で返す（脆弱）
app.get("/static/", (c) => {
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
app.get("/static/:filename", (c) => {
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
app.get("/", (c) => {
  return c.json({
    message: "これは脆弱なエンドポイントです",
    hint: "ディレクトリにアクセスしてファイル一覧を取得してみてください",
    paths: [
      "/api/labs/directory-listing/vulnerable/static/",
    ],
  });
});

export default app;
