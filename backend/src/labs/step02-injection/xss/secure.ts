import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";
import { escapeHtml } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ Reflected XSS対策: 出力時にHTMLエスケープを行う
app.get("/search", (c) => {
  const q = c.req.query("q") ?? "";

  // ✅ escapeHtml() でHTML特殊文字を文字参照に変換
  // <script>alert(1)</script> → &lt;script&gt;alert(1)&lt;/script&gt;
  // ブラウザはこれをテキストとして表示し、スクリプトは実行されない
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>検索結果</title></head>
<body>
  <h1>検索結果: ${escapeHtml(q)}</h1>
  <p>「${escapeHtml(q)}」の検索結果はありません。</p>
  <a href="/api/labs/xss/secure/search">戻る</a>
</body></html>`;

  return c.html(html);
});

// ✅ Stored XSS対策: 保存時は同じだが、表示時にエスケープする
app.post("/posts", async (c) => {
  const body = await c.req.json<{ title: string; content: string }>();
  const { title, content } = body;
  const pool = getPool();

  // ✅ 入力値のバリデーション
  if (!title || !content) {
    return c.json({ success: false, message: "タイトルと内容を入力してください" }, 400);
  }

  try {
    await pool.query(
      "INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3)",
      [1, title, content]
    );
    return c.json({ success: true, message: "投稿しました" });
  } catch (err) {
    console.error("Post error:", (err as Error).message);
    return c.json({ success: false, message: "投稿に失敗しました" }, 500);
  }
});

// ✅ Stored XSS対策: 表示時にHTMLエスケープする
app.get("/posts", async (c) => {
  const pool = getPool();

  try {
    const result = await pool.query(
      "SELECT id, title, content, created_at FROM posts ORDER BY id DESC LIMIT 20"
    );

    // ✅ DB値をエスケープしてからHTMLに埋め込む
    const postsHtml = result.rows
      .map(
        (p) => `<div style="border:1px solid #ccc;padding:12px;margin:8px 0;border-radius:4px;">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.content)}</p>
        <small style="color:#888">${escapeHtml(String(p.created_at))}</small>
      </div>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>掲示板</title></head>
<body>
  <h1>掲示板（安全バージョン）</h1>
  <p style="color:#080;">✅ このページはXSS対策済みです</p>
  ${postsHtml}
  <a href="/api/labs/xss/secure/search">検索ページ</a>
</body></html>`;

    return c.html(html);
  } catch (err) {
    console.error("Posts fetch error:", (err as Error).message);
    return c.json({ error: "投稿の取得に失敗しました" }, 500);
  }
});

// ✅ JSON API版（安全）: エスケープ済みのデータを返す
app.get("/api/search", (c) => {
  const q = c.req.query("q") ?? "";
  // ✅ エスケープ済みのHTMLフラグメントを返す
  return c.json({
    query: q,
    html: `<p>検索結果: ${escapeHtml(q)}</p><p>「${escapeHtml(q)}」に一致する結果はありません。</p>`,
  });
});

app.get("/api/posts", async (c) => {
  const pool = getPool();
  try {
    const result = await pool.query(
      "SELECT id, title, content, created_at FROM posts ORDER BY id DESC LIMIT 20"
    );
    return c.json({
      posts: result.rows,
      // ✅ エスケープ済みのHTMLフラグメント
      postsHtml: result.rows
        .map(
          (p) =>
            `<div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.content)}</p></div>`
        )
        .join(""),
    });
  } catch (err) {
    console.error("Posts fetch error:", (err as Error).message);
    return c.json({ posts: [], message: "投稿の取得に失敗しました" }, 500);
  }
});

export default app;
