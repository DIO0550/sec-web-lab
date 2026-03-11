import { Hono } from "hono";
import * as shared from "./shared.js";

const app = new Hono();

// --- 安全バージョン ---

// ✅ ミューテックスで排他制御
app.post("/purchase", async (c) => {
  const body = await c.req.json<{ productId: string }>();

  // ✅ ロック取得を待機
  while (shared.secureLock) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  shared.setSecureLock(true);

  try {
    // ✅ ロック内で在庫チェックと更新をアトミックに実行
    if (shared.secureStock <= 0) {
      return c.json({ success: false, message: "在庫切れです" }, 400);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    shared.setSecureStock(shared.secureStock - 1);
    shared.setSecurePurchaseCount(shared.securePurchaseCount + 1);

    return c.json({
      success: true,
      message: `購入成功！（購入番号: #${shared.securePurchaseCount}）`,
      stock: shared.secureStock,
    });
  } finally {
    // ✅ 必ずロックを解放
    shared.setSecureLock(false);
  }
});

app.get("/stock", (c) => {
  return c.json({ stock: shared.secureStock, purchases: shared.securePurchaseCount });
});

export default app;
