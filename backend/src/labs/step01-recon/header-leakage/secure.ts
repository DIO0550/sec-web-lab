import { Hono } from "hono";

const app = new Hono();

// --- 安全バージョン ---
// ✅ 不要なヘッダーを削除し、セキュリティヘッダーを付与する
// X-Powered-By や Server ヘッダーを削除することで、技術スタックを隠蔽する
app.get("/", async (c) => {
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
