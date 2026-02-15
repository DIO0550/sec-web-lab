import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Security Header Misconfiguration
// セキュリティヘッダーの欠如による脆弱性
// ========================================

// --- 脆弱バージョン ---
// ⚠️ セキュリティヘッダーが一切設定されていない
// ブラウザの保護機能が有効にならず、XSSやクリックジャッキングに対して無防備

app.get("/vulnerable/", (c) => {
  // ⚠️ セキュリティヘッダーなしでレスポンスを返す（脆弱）
  // ブラウザの保護機能が有効にならない
  return c.json({
    message: "これは脆弱なエンドポイントです",
    hint: "レスポンスヘッダーを確認してください。セキュリティヘッダーが欠如しています",
    missing_headers: [
      "X-Content-Type-Options (MIMEスニッフィング防止)",
      "X-Frame-Options (クリックジャッキング防止)",
      "X-XSS-Protection (XSSフィルター)",
      "Content-Security-Policy (リソース読み込み制限)",
      "Strict-Transport-Security (HTTPS強制)",
      "Referrer-Policy (リファラー制御)",
    ],
  });
});

// 脆弱バージョンの HTML ページ（iframe埋め込みテスト用）
app.get("/vulnerable/page", (c) => {
  // ⚠️ X-Frame-Options がないため、iframe に埋め込み可能（クリックジャッキングの標的になる）
  const html = `<!DOCTYPE html>
<html>
<head><title>脆弱なページ</title></head>
<body>
<h1>機密操作ページ</h1>
<p>このページは iframe に埋め込まれる可能性があります。</p>
<button onclick="alert('送金処理が実行されました')">送金する</button>
</body>
</html>`;
  return c.html(html);
});

// --- 安全バージョン ---
// ✅ セキュリティヘッダーをミドルウェアで一括付与する

app.use("/secure/*", async (c, next) => {
  await next();

  // ✅ MIMEスニッフィングの防止
  c.res.headers.set("X-Content-Type-Options", "nosniff");

  // ✅ iframe埋め込みの防止（クリックジャッキング対策）
  c.res.headers.set("X-Frame-Options", "DENY");

  // ✅ XSSフィルターの有効化（レガシーブラウザ向け）
  c.res.headers.set("X-XSS-Protection", "1; mode=block");

  // ✅ リソース読み込み元の制限（XSS対策の追加防御層）
  c.res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'"
  );

  // ✅ HTTPS の強制（本番環境向け）
  c.res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // ✅ リファラー情報の制御
  c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
});

app.get("/secure/", (c) => {
  return c.json({
    message: "これは安全なエンドポイントです",
    hint: "レスポンスヘッダーを確認してください。セキュリティヘッダーが適切に設定されています",
    security_headers: [
      "X-Content-Type-Options: nosniff",
      "X-Frame-Options: DENY",
      "X-XSS-Protection: 1; mode=block",
      "Content-Security-Policy: default-src 'self'; script-src 'self'",
      "Strict-Transport-Security: max-age=31536000; includeSubDomains",
      "Referrer-Policy: strict-origin-when-cross-origin",
    ],
  });
});

// 安全バージョンの HTML ページ（iframe埋め込みが拒否される）
app.get("/secure/page", (c) => {
  // ✅ X-Frame-Options: DENY により、iframe への埋め込みがブラウザに拒否される
  const html = `<!DOCTYPE html>
<html>
<head><title>安全なページ</title></head>
<body>
<h1>機密操作ページ（安全版）</h1>
<p>このページは X-Frame-Options: DENY により iframe への埋め込みが拒否されます。</p>
<button onclick="alert('送金処理が実行されました')">送金する</button>
</body>
</html>`;
  return c.html(html);
});

export default app;
