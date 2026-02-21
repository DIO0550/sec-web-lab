import { Hono } from "hono";

const app = new Hono();

// ========================================
// Lab: Race Condition (レースコンディション)
// 同時実行で在庫チェックと在庫更新の間を突く
// ========================================

// デモ用データ
let vulnStock = 1; // 残り1個
let secureStock = 1;
let vulnPurchaseCount = 0;
let securePurchaseCount = 0;

// --- 脆弱バージョン ---

// ⚠️ Check-Then-Act パターン — 在庫チェックと更新の間にタイムラグ
app.post("/vulnerable/purchase", async (c) => {
  const body = await c.req.json<{ productId: string }>();

  // ⚠️ Step 1: 在庫チェック
  if (vulnStock <= 0) {
    return c.json({ success: false, message: "在庫切れです" }, 400);
  }

  // ⚠️ 処理の遅延をシミュレーション（この間に別のリクエストが割り込める）
  await new Promise((resolve) => setTimeout(resolve, 100));

  // ⚠️ Step 2: 在庫を減らす（チェック時と状態が変わっている可能性あり）
  vulnStock--;
  vulnPurchaseCount++;

  return c.json({
    success: true,
    message: `購入成功！（購入番号: #${vulnPurchaseCount}）`,
    stock: vulnStock,
    _debug: {
      message: "Check-Then-Actパターン: 在庫チェック〜更新間に別リクエストが割り込める",
      totalPurchases: vulnPurchaseCount,
      currentStock: vulnStock,
    },
  });
});

app.get("/vulnerable/stock", (c) => {
  return c.json({ stock: vulnStock, purchases: vulnPurchaseCount });
});

// --- 安全バージョン ---

// ✅ ミューテックスで排他制御
let secureLock = false;

app.post("/secure/purchase", async (c) => {
  const body = await c.req.json<{ productId: string }>();

  // ✅ ロック取得を待機
  while (secureLock) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  secureLock = true;

  try {
    // ✅ ロック内で在庫チェックと更新をアトミックに実行
    if (secureStock <= 0) {
      return c.json({ success: false, message: "在庫切れです" }, 400);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    secureStock--;
    securePurchaseCount++;

    return c.json({
      success: true,
      message: `購入成功！（購入番号: #${securePurchaseCount}）`,
      stock: secureStock,
    });
  } finally {
    // ✅ 必ずロックを解放
    secureLock = false;
  }
});

app.get("/secure/stock", (c) => {
  return c.json({ stock: secureStock, purchases: securePurchaseCount });
});

// リセット
app.post("/reset", (c) => {
  vulnStock = 1;
  secureStock = 1;
  vulnPurchaseCount = 0;
  securePurchaseCount = 0;
  secureLock = false;
  return c.json({ message: "リセットしました" });
});

export default app;
