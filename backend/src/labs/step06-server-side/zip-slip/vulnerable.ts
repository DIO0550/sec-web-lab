import { Hono } from "hono";
import path from "node:path";

const app = new Hono();

// --- 脆弱バージョン ---

const EXTRACT_DIR = "/uploads";

// ⚠️ パストラバーサル検証なしでZIPエントリの展開パスをシミュレーション
// 実際にファイルは作成せず、展開先パスを表示するだけ（安全なデモ）
app.post("/extract", async (c) => {
  const body = await c.req.json<{
    entries: { name: string; content: string }[];
  }>();
  const { entries } = body;

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return c.json(
      { success: false, message: "展開するエントリがありません" },
      400
    );
  }

  // ⚠️ エントリのパスを検証せずにpath.joinで結合
  // → "../" を含むパスが展開先ディレクトリ外を指す
  const extracted: { name: string; path: string; status: string }[] = [];

  for (const entry of entries) {
    // ⚠️ path.joinは ../  を正規化するため、ディレクトリ外のパスが生成される
    const filePath = path.join(EXTRACT_DIR, entry.name);

    extracted.push({
      name: entry.name,
      path: filePath,
      status: "ok",
    });
  }

  return c.json({
    success: true,
    message: "展開完了（シミュレーション）",
    extractDir: EXTRACT_DIR,
    extracted,
    _debug: {
      message:
        "パストラバーサル検証なし: ../を含むエントリが展開先ディレクトリ外を指す",
    },
  });
});

export default app;
