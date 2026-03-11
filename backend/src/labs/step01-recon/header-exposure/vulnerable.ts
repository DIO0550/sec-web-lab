import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---
// ⚠️ セキュリティヘッダーが一切設定されていない
// ブラウザの保護機能が有効にならず、XSSやクリックジャッキングに対して無防備

app.get("/", (c) => {
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
app.get("/page", (c) => {
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

export default app;
