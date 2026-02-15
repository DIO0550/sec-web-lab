import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: HTTP Header Information Leakage
// HTTPレスポンスヘッダーからの情報漏洩
// ========================================

// --- 脆弱バージョン ---
// ⚠️ デフォルトのヘッダーに加えて、意図的に技術情報を含むヘッダーを付与する
// 攻撃者は curl -I でこれらの情報を取得し、CVE検索に利用できる
app.get("/vulnerable/", async (c) => {
  // フレームワーク名やバージョン情報をヘッダーに露出させる（脆弱）
  c.header("X-Powered-By", "Hono v4.6.0");
  c.header("Server", "Node.js/20.11.0");
  c.header("X-Runtime", "0.023");
  c.header("X-Debug-Mode", "true");
  c.header("X-App-Version", "1.0.0-beta");

  return c.json({
    message: "これは脆弱なエンドポイントです",
    hint: "レスポンスヘッダーを確認してください（curl -I または DevTools の Network タブ）",
  });
});

// --- 安全バージョン ---
// ✅ 不要なヘッダーを削除し、セキュリティヘッダーを付与する
// X-Powered-By や Server ヘッダーを削除することで、技術スタックを隠蔽する
app.get("/secure/", async (c) => {
  // 不要なヘッダーを削除
  c.res.headers.delete("X-Powered-By");
  c.res.headers.delete("Server");

  // セキュリティヘッダーを付与
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");

  return c.json({
    message: "これは安全なエンドポイントです",
    hint: "レスポンスヘッダーを確認してください。技術情報が含まれていないことを確認しましょう",
  });
});

export default app;
