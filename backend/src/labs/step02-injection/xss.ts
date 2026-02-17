import { Hono } from "hono";
import { getPool } from "../../db/pool.js";

const app = new Hono();

// ========================================
// Lab: Cross-Site Scripting (XSS)
// ユーザー入力がHTMLとして解釈される脆弱性
// ========================================

// --- HTMLエスケープ関数 ---
// ✅ HTML特殊文字を文字参照（エンティティ）に変換する
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --- 脆弱バージョン ---

// ⚠️ Reflected XSS: URLパラメータの値をエスケープせずにHTMLに埋め込む
// <script>alert('XSS')</script> を q に入力するとスクリプトが実行される
app.get("/vulnerable/search", (c) => {
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
app.post("/vulnerable/posts", async (c) => {
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
app.get("/vulnerable/posts", async (c) => {
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
app.get("/vulnerable/api/search", (c) => {
  const q = c.req.query("q") ?? "";
  // ⚠️ 入力値をエスケープせずにHTMLフラグメントとして返す
  return c.json({
    query: q,
    html: `<p>検索結果: ${q}</p><p>「${q}」に一致する結果はありません。</p>`,
  });
});

// ⚠️ Stored XSS (JSON): 投稿データをエスケープせずにHTMLとして返す
app.get("/vulnerable/api/posts", async (c) => {
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

// --- 安全バージョン ---

// ✅ Reflected XSS対策: 出力時にHTMLエスケープを行う
app.get("/secure/search", (c) => {
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
app.post("/secure/posts", async (c) => {
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
app.get("/secure/posts", async (c) => {
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
app.get("/secure/api/search", (c) => {
  const q = c.req.query("q") ?? "";
  // ✅ エスケープ済みのHTMLフラグメントを返す
  return c.json({
    query: q,
    html: `<p>検索結果: ${escapeHtml(q)}</p><p>「${escapeHtml(q)}」に一致する結果はありません。</p>`,
  });
});

app.get("/secure/api/posts", async (c) => {
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
