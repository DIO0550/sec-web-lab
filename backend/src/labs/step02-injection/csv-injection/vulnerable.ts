import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// インメモリでフィードバックデータを保存
type Feedback = { name: string; comment: string; date: string };
const feedbacks: Feedback[] = [];

// ⚠️ CSV Injection: ユーザー入力をそのまま保存（サニタイズなし）
app.post("/feedback", async (c) => {
  const body = await c.req.json<{ name: string; comment: string }>();
  const { name, comment } = body;

  if (!name || !comment) {
    return c.json(
      { success: false, message: "名前とコメントを入力してください" },
      400
    );
  }

  // ⚠️ ユーザー入力をそのまま保存 — =, +, -, @ で始まる値も許可
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

// ⚠️ CSV Injection: エスケープなしで CSV エクスポート
// =, +, -, @ で始まるセル値がスプレッドシートで数式として実行される
app.get("/export", (c) => {
  const csv = [
    "Name,Comment,Date",
    ...feedbacks.map(
      // ⚠️ ユーザー入力をそのまま CSV に埋め込む
      // =HYPERLINK("http://evil.com","Click") のような値が
      // Excel/Google Sheets で数式として実行される
      (row) => `${row.name},${row.comment},${row.date}`
    ),
  ].join("\n");

  return c.json({
    success: true,
    csv,
    feedbacks,
    _debug: {
      warning:
        "CSVにユーザー入力がエスケープなしで含まれています。Excelで開くと数式が実行されます。",
    },
  });
});

export default app;
