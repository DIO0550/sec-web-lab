import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs/promises";

const app = new Hono();

// ========================================
// Lab: Path Traversal
// ../ でサーバーの秘密ファイルを読み取る
// ========================================

// アップロードディレクトリのベースパス
const BASE_DIR = path.resolve(process.cwd(), "uploads");

// --- 脆弱バージョン ---

// ⚠️ ファイル取得: ユーザー入力をそのままファイルパスに結合
// ../../../etc/passwd 等でサーバー上の任意のファイルを読み取れる
app.get("/vulnerable/files", async (c) => {
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
app.get("/vulnerable/list", async (c) => {
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

// --- 安全バージョン ---

// ✅ ファイル取得: path.resolve() + startsWith() でベースディレクトリ内に制限
app.get("/secure/files", async (c) => {
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
