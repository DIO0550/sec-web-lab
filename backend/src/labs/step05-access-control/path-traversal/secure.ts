import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs/promises";
import { BASE_DIR } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ファイル取得: path.resolve() + startsWith() でベースディレクトリ内に制限
app.get("/files", async (c) => {
  const fileName = c.req.query("name");

  if (!fileName) {
    return c.json({ success: false, message: "ファイル名を指定してください（例: ?name=sample.txt）" }, 400);
  }

  try {
    // ✅ path.resolve() でパスを正規化し、絶対パスに変換
    const resolvedPath = path.resolve(BASE_DIR, fileName);

    // ✅ 正規化後のパスがベースディレクトリ内に収まっているか検証
    // "../" で遡った場合、resolvedPath は BASE_DIR の外を指すため検出できる
    if (!resolvedPath.startsWith(BASE_DIR + path.sep) && resolvedPath !== BASE_DIR) {
      return c.json({
        success: false,
        message: "アクセスが拒否されました: 許可されたディレクトリ外へのアクセスです",
        _debug: {
          message: "パス検証: 正規化後のパスがベースディレクトリ外を指しているため拒否しました",
          resolvedPath,
          baseDir: BASE_DIR,
          check: `startsWith("${BASE_DIR}${path.sep}") → false`,
        },
      }, 403);
    }

    const content = await fs.readFile(resolvedPath, "utf-8");

    return c.json({
      success: true,
      fileName,
      content,
    });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      return c.json({ success: false, message: `ファイルが見つかりません: ${fileName}` }, 404);
    }
    return c.json({ success: false, message: "ファイルの読み取りに失敗しました" }, 500);
  }
});

export default app;
