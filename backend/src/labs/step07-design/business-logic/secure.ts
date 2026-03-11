import { Hono } from "hono";
import { PRODUCTS, balances } from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ サーバー側で価格を参照し、数量・在庫・残高を検証
app.post("/order", async (c) => {
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
  if (total > balances.secure) {
    return c.json({ success: false, message: "残高が不足しています" }, 400);
  }

  balances.secure -= total;

  return c.json({
    success: true,
    message: `${product.name} x ${quantity} を購入しました`,
    order: {
      product: product.name,
      quantity,
      unitPrice: product.price,
      total,
      balance: balances.secure,
    },
  });
});

app.get("/balance", (c) => {
  return c.json({ balance: balances.secure });
});

export default app;
