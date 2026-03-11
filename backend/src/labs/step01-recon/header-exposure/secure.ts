import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---
// ✅ セキュリティヘッダーをミドルウェアで一括付与する

app.use("/*", async (c, next) => {
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

app.get("/", (c) => {
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
app.get("/page", (c) => {
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
