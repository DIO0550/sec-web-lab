import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---

// インメモリでフィードバックデータを保存
type Feedback = { name: string; comment: string; date: string };
const feedbacks: Feedback[] = [];

// ✅ 数式として解釈される危険な先頭文字
const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

// ✅ CSVセルの値を安全にエスケープする関数
// 数式トリガー文字で始まる値の先頭にシングルクォートを付加し、
// スプレッドシートがテキストとして扱うようにする
function escapeCsvCell(value: string): string {
  let escaped = value;

  // ✅ 数式インジェクション対策: 危険な先頭文字の前にシングルクォートを付加
  if (FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    escaped = `'${value}`;
  }

  // ✅ 標準的な CSV エスケープ: カンマ、改行、ダブルクォートを含む場合
  if (
    escaped.includes(",") ||
    escaped.includes("\n") ||
    escaped.includes('"')
  ) {
    escaped = `"${escaped.replace(/"/g, '""')}"`;
  }

  return escaped;
}

app.post("/feedback", async (c) => {
  const body = await c.req.json<{ name: string; comment: string }>();
  const { name, comment } = body;

  if (!name || !comment) {
    return c.json(
      { success: false, message: "名前とコメントを入力してください" },
      400
    );
  }

  feedbacks.push({
    name,
    comment,
    date: new Date().toISOString().split("T")[0],
  });

  return c.json({
    success: true,
    message: "フィードバックを登録しました",
    count: feedbacks.length,
  });
});

// ✅ CSV エクスポート時に数式インジェクションを防止
app.get("/export", (c) => {
  const csv = [
    "Name,Comment,Date",
    ...feedbacks.map(
      // ✅ escapeCsvCell() で全セル値をエスケープ
      // =HYPERLINK(...) → '=HYPERLINK(...) に変換され、
      // スプレッドシートがテキストとして扱う
      (row) =>
        `${escapeCsvCell(row.name)},${escapeCsvCell(row.comment)},${escapeCsvCell(row.date)}`
    ),
  ].join("\n");

  return c.json({
    success: true,
    csv,
    feedbacks,
    _debug: {
      info: "CSVセル値は数式インジェクション対策済みです。先頭の=+-@にはシングルクォートが付加されています。",
    },
  });
});

export default app;
