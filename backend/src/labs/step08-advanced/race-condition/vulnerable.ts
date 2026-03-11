import { Hono } from "hono";
import * as shared from "./shared.js";

const app = new Hono();

// --- 脆弱バージョン ---

// ⚠️ Check-Then-Act パターン — 在庫チェックと更新の間にタイムラグ
app.post("/purchase", async (c) => {
  const body = await c.req.json<{ productId: string }>();

  // ⚠️ Step 1: 在庫チェック
  if (shared.vulnStock <= 0) {
    return c.json({ success: false, message: "在庫切れです" }, 400);
  }

  // ⚠️ 処理の遅延をシミュレーション（この間に別のリクエストが割り込める）
  await new Promise((resolve) => setTimeout(resolve, 100));

  // ⚠️ Step 2: 在庫を減らす（チェック時と状態が変わっている可能性あり）
  shared.setVulnStock(shared.vulnStock - 1);
  shared.setVulnPurchaseCount(shared.vulnPurchaseCount + 1);

  return c.json({
    success: true,
    message: `購入成功！（購入番号: #${shared.vulnPurchaseCount}）`,
    stock: shared.vulnStock,
    _debug: {
      message: "Check-Then-Actパターン: 在庫チェック〜更新間に別リクエストが割り込める",
      totalPurchases: shared.vulnPurchaseCount,
      currentStock: shared.vulnStock,
    },
  });
});

app.get("/stock", (c) => {
  return c.json({ stock: shared.vulnStock, purchases: shared.vulnPurchaseCount });
});

export default app;
