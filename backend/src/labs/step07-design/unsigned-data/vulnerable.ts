import { Hono } from "hono";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ CookieのroleフィールドをそのまLinkm信頼
app.get("/admin", (c) => {
  // ⚠️ Cookieの値を検証なしで信頼（改ざん可能）
  const role = c.req.header("X-User-Role") || "user";

  if (role !== "admin") {
    return c.json({
      success: false,
      message: "管理者権限が必要です",
      _debug: { message: "ヘッダーの role を検証なしで信頼しています", currentRole: role },
    }, 403);
  }

  return c.json({
    success: true,
    message: "管理者ページにアクセスしました",
    adminData: {
      totalUsers: 150,
      totalRevenue: "¥12,500,000",
      serverInfo: "web-01.internal",
    },
    _debug: {
      message: "X-User-Role ヘッダーを改ざんするだけで管理者アクセスが可能",
    },
  });
});

// ⚠️ クライアント指定の価格を信頼
app.post("/purchase", async (c) => {
  const body = await c.req.json<{ productId: string; price: number }>();
  const { productId, price } = body;

  // ⚠️ クライアントが送信した価格をそのまま使用
  return c.json({
    success: true,
    message: `商品 ${productId} を ¥${price} で購入しました`,
    _debug: {
      message: "クライアント指定の価格を信頼: price=0 で無料購入可能",
    },
  });
});

export default app;
