import { Hono } from "hono";
import { PRODUCTS, balances } from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ クライアントから送信された価格・数量をそのまま信頼
app.post("/order", async (c) => {
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

  balances.vulnerable -= total;

  return c.json({
    success: true,
    message: `${product.name} x ${quantity} を購入しました`,
    order: {
      product: product.name,
      quantity,
      unitPrice,
      total,
      balance: balances.vulnerable,
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

app.get("/balance", (c) => {
  return c.json({ balance: balances.vulnerable });
});

export default app;
