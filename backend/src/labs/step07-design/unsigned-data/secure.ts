import { Hono } from "hono";
import { sessions, PRODUCTS } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ サーバー側のセッションからロールを取得
app.get("/admin", (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId) {
    return c.json({ success: false, message: "ログインが必要です" }, 401);
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return c.json({ success: false, message: "無効なセッションです" }, 401);
  }

  // ✅ サーバー側のセッションデータからロールを検証
  if (session.role !== "admin") {
    return c.json({ success: false, message: "管理者権限が必要です" }, 403);
  }

  return c.json({
    success: true,
    message: "管理者ページにアクセスしました",
    adminData: {
      totalUsers: 150,
      totalRevenue: "¥12,500,000",
    },
  });
});

// ✅ サーバー側で価格を参照
app.post("/purchase", async (c) => {
  const body = await c.req.json<{ productId: string }>();
  const { productId } = body;

  // ✅ サーバー側のデータベースから価格を取得（クライアントの値を使わない）
  const product = PRODUCTS[productId];
  if (!product) {
    return c.json({ success: false, message: "商品が見つかりません" }, 404);
  }

  return c.json({
    success: true,
    message: `${product.name} を ¥${product.price.toLocaleString()} で購入しました`,
  });
});

export default app;
