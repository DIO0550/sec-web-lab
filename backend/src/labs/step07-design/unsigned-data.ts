import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Unsigned Data (署名なしデータの信頼)
// クライアントデータを署名なしで信頼してしまう
// ========================================

// --- 脆弱バージョン ---

// ⚠️ CookieのroleフィールドをそのまLinkm信頼
app.get("/vulnerable/admin", (c) => {
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
app.post("/vulnerable/purchase", async (c) => {
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

// --- 安全バージョン ---

// インメモリセッション（デモ用）
const sessions = new Map<string, { userId: string; role: string }>();
sessions.set("demo-admin-session", { userId: "1", role: "admin" });
sessions.set("demo-user-session", { userId: "2", role: "user" });

// 商品データベース（サーバー側で価格を管理）
const PRODUCTS: Record<string, { name: string; price: number }> = {
  "1": { name: "ノートPC", price: 150000 },
  "2": { name: "マウス", price: 3000 },
};

// ✅ サーバー側のセッションからロールを取得
app.get("/secure/admin", (c) => {
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
app.post("/secure/purchase", async (c) => {
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
