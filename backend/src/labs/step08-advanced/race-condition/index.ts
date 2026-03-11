import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import {
  setVulnStock,
  setSecureStock,
  setVulnPurchaseCount,
  setSecurePurchaseCount,
  setSecureLock,
} from "./shared.js";

const app = new Hono();

// ========================================
// Lab: Race Condition (レースコンディション)
// 同時実行で在庫チェックと在庫更新の間を突く
// ========================================

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// リセット
app.post("/reset", (c) => {
  setVulnStock(1);
  setSecureStock(1);
  setVulnPurchaseCount(0);
  setSecurePurchaseCount(0);
  setSecureLock(false);
  return c.json({ message: "リセットしました" });
});

export default app;
