import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs/promises";
import { BASE_DIR } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ ファイル取得: ユーザー入力をそのままファイルパスに結合
// ../../../etc/passwd 等でサーバー上の任意のファイルを読み取れる
app.get("/files", async (c) => {
  const fileName = c.req.query("name");

  if (!fileName) {
    return c.json({ success: false, message: "ファイル名を指定してください（例: ?name=sample.txt）" }, 400);
  }

  try {
    // ⚠️ ユーザー入力をそのまま path.join() に渡している
    // "../../../etc/passwd" が入力されると、公開ディレクトリ外のファイルが読み取れる
    const filePath = path.join(BASE_DIR, fileName);

    const content = await fs.readFile(filePath, "utf-8");

    return c.json({
      success: true,
      fileName,
      content,
      _debug: {
        message: "パス検証なし: ユーザー入力をそのままパスに結合しています",
        resolvedPath: filePath,
        baseDir: BASE_DIR,
      },
    });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      return c.json({ success: false, message: `ファイルが見つかりません: ${fileName}` }, 404);
    }
    return c.json({ success: false, message: "ファイルの読み取りに失敗しました" }, 500);
  }
});

// ⚠️ ファイル一覧（学習用）
app.get("/list", async (c) => {
  try {
    const files = await fs.readdir(BASE_DIR);
    return c.json({
      success: true,
      files,
      _debug: {
        message: "公開ディレクトリのファイル一覧",
        baseDir: BASE_DIR,
      },
    });
  } catch {
    return c.json({ success: true, files: [], message: "uploads ディレクトリが存在しません" });
  }
});

export default app;
