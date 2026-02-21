import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Business Logic Flaws
// ビジネスロジックの欠陥
// ========================================

// デモ用商品データ
const PRODUCTS: Record<string, { name: string; price: number; stock: number }> = {
  "1": { name: "ノートPC", price: 150000, stock: 5 },
  "2": { name: "マウス", price: 3000, stock: 20 },
  "3": { name: "キーボード", price: 8000, stock: 10 },
};

// ユーザー残高
let vulnBalance = 200000;
let secureBalance = 200000;

// --- 脆弱バージョン ---

// ⚠️ クライアントから送信された価格・数量をそのまま信頼
app.post("/vulnerable/order", async (c) => {
  const body = await c.req.json<{ productId: string; quantity: number; price?: number }>();
  const { productId, quantity, price } = body;

  const product = PRODUCTS[productId];
  if (!product) {
    return c.json({ success: false, message: "商品が見つかりません" }, 404);
  }

  // ⚠️ クライアント指定の価格を信頼（改ざん可能）
  const unitPrice = price ?? product.price;
  // ⚠️ 数量の検証なし（負の数が可能 → 残高が増える）
  const total = unitPrice * quantity;

  vulnBalance -= total;

  return c.json({
    success: true,
    message: `${product.name} x ${quantity} を購入しました`,
    order: {
      product: product.name,
      quantity,
      unitPrice,
      total,
      balance: vulnBalance,
    },
    _debug: {
      message: "クライアントの価格を信頼 + 数量の範囲チェックなし",
      risks: [
        "price: 0 で無料購入",
        "quantity: -1 で残高増加",
        "在庫チェックなし",
      ],
    },
  });
});

app.get("/vulnerable/balance", (c) => {
  return c.json({ balance: vulnBalance });
});

// --- 安全バージョン ---

// ✅ サーバー側で価格を参照し、数量・在庫・残高を検証
app.post("/secure/order", async (c) => {
  const body = await c.req.json<{ productId: string; quantity: number }>();
  const { productId, quantity } = body;

  const product = PRODUCTS[productId];
  if (!product) {
    return c.json({ success: false, message: "商品が見つかりません" }, 404);
  }

  // ✅ 数量の範囲チェック
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return c.json({ success: false, message: "数量は1〜99の整数で指定してください" }, 400);
  }

  // ✅ サーバー側で価格を参照（クライアントの値を使わない）
  const total = product.price * quantity;

  // ✅ 在庫チェック
  if (quantity > product.stock) {
    return c.json({ success: false, message: `在庫不足です（残り: ${product.stock}個）` }, 400);
  }

  // ✅ 残高チェック
  if (total > secureBalance) {
    return c.json({ success: false, message: "残高が不足しています" }, 400);
  }

  secureBalance -= total;

  return c.json({
    success: true,
    message: `${product.name} x ${quantity} を購入しました`,
    order: {
      product: product.name,
      quantity,
      unitPrice: product.price,
      total,
      balance: secureBalance,
    },
  });
});

app.get("/secure/balance", (c) => {
  return c.json({ balance: secureBalance });
});

// 商品一覧
app.get("/products", (c) => {
  return c.json({
    products: Object.entries(PRODUCTS).map(([id, p]) => ({ id, ...p })),
  });
});

// リセット
app.post("/reset", (c) => {
  vulnBalance = 200000;
  secureBalance = 200000;
  PRODUCTS["1"].stock = 5;
  PRODUCTS["2"].stock = 20;
  PRODUCTS["3"].stock = 10;
  return c.json({ message: "リセットしました" });
});

export default app;
