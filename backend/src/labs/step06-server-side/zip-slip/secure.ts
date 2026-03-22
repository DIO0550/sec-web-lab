import { Hono } from "hono";
import path from "node:path";

const app = new Hono();

// --- 安全バージョン ---

const EXTRACT_DIR = "/uploads";

// ✅ パストラバーサルを検出して拒否する
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

  // ✅ 展開先ディレクトリの絶対パスを正規化（末尾にセパレータを付与）
  const safeExtractDir = path.resolve(EXTRACT_DIR) + path.sep;

  const extracted: { name: string; path: string; status: string }[] = [];
  const blocked: { name: string; reason: string }[] = [];

  for (const entry of entries) {
    // ✅ path.resolveで絶対パスに解決し、展開先ディレクトリ内に収まるか検証
    const resolvedPath = path.resolve(EXTRACT_DIR, entry.name);

    if (!resolvedPath.startsWith(safeExtractDir)) {
      // ✅ パストラバーサルを検出 — このエントリは展開しない
      blocked.push({
        name: entry.name,
        reason: "パストラバーサル検出",
      });
      continue;
    }

    extracted.push({
      name: entry.name,
      path: resolvedPath,
      status: "ok",
    });
  }

  return c.json({
    success: true,
    message:
      blocked.length > 0
        ? `展開完了（${blocked.length}件のエントリをブロック）`
        : "展開完了（シミュレーション）",
    extractDir: EXTRACT_DIR,
    extracted,
    blocked,
    _debug: {
      message: "path.resolve + startsWith でプレフィックス検証を実施",
    },
  });
});

export default app;
