import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---
// ⚠️ デフォルトのヘッダーに加えて、意図的に技術情報を含むヘッダーを付与する
// 攻撃者は curl -I でこれらの情報を取得し、CVE検索に利用できる
app.get("/", async (c) => {
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

export default app;
