import { Hono } from "hono";
import { getPool } from "../../../db/pool.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ Reflected XSS: URLパラメータの値をエスケープせずにHTMLに埋め込む
// <script>alert('XSS')</script> を q に入力するとスクリプトが実行される
app.get("/search", (c) => {
  const q = c.req.query("q") ?? "";

  // ⚠️ ユーザー入力をそのままHTMLに埋め込む — Reflected XSSの脆弱性
  // ブラウザは <script> タグを正規のスクリプトとして実行する
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>検索結果</title></head>
<body>
  <h1>検索結果: ${q}</h1>
  <p>「${q}」の検索結果はありません。</p>
  <a href="/api/labs/xss/vulnerable/search">戻る</a>
</body></html>`;

  return c.html(html);
});

// ⚠️ Stored XSS: 投稿をエスケープせずにDBに保存し、表示時もエスケープしない
app.post("/posts", async (c) => {
  const body = await c.req.json<{ title: string; content: string }>();
  const { title, content } = body;
  const pool = getPool();

  try {
    // ⚠️ ユーザー入力をそのままDBに保存（エスケープなし）
    await pool.query(
      "INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3)",
      [1, title, content]
    );
    return c.json({ success: true, message: "投稿しました" });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

// ⚠️ Stored XSS: 保存された投稿をエスケープせずにHTMLとして出力
app.get("/posts", async (c) => {
  const pool = getPool();

  try {
    const result = await pool.query(
      "SELECT id, title, content, created_at FROM posts ORDER BY id DESC LIMIT 20"
    );

    // ⚠️ DB値をそのままHTMLに埋め込む — Stored XSSの脆弱性
    // <img src=x onerror=alert(1)> 等が投稿されていると、閲覧時にスクリプトが実行される
    const postsHtml = result.rows
      .map(
        (p) => `<div style="border:1px solid #ccc;padding:12px;margin:8px 0;border-radius:4px;">
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <small style="color:#888">${p.created_at}</small>
      </div>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>掲示板</title></head>
<body>
  <h1>掲示板（脆弱バージョン）</h1>
  <p style="color:#c00;">⚠️ このページはXSS脆弱性を含んでいます</p>
  ${postsHtml}
  <a href="/api/labs/xss/vulnerable/search">検索ページ</a>
</body></html>`;

    return c.html(html);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

// --- JSON API版（フロントエンド連携用）---

// ⚠️ Reflected XSS (JSON): 入力値をそのまま返す（フロントエンドで dangerouslySetInnerHTML 等を使うと危険）
app.get("/api/search", (c) => {
  const q = c.req.query("q") ?? "";
  // ⚠️ 入力値をエスケープせずにHTMLフラグメントとして返す
  return c.json({
    query: q,
    html: `<p>検索結果: ${q}</p><p>「${q}」に一致する結果はありません。</p>`,
  });
});

// ⚠️ Stored XSS (JSON): 投稿データをエスケープせずにHTMLとして返す
app.get("/api/posts", async (c) => {
  const pool = getPool();
  try {
    const result = await pool.query(
      "SELECT id, title, content, created_at FROM posts ORDER BY id DESC LIMIT 20"
    );
    return c.json({
      posts: result.rows,
      // ⚠️ エスケープなしのHTMLフラグメント
      postsHtml: result.rows
        .map((p) => `<div><h3>${p.title}</h3><p>${p.content}</p></div>`)
        .join(""),
    });
  } catch (err) {
    return c.json({ posts: [], error: (err as Error).message }, 500);
  }
});

export default app;
