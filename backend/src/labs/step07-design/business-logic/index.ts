import { Hono } from "hono";
import vulnerable from "./vulnerable.js";
import secure from "./secure.js";
import { PRODUCTS, balances } from "./shared.js";

// ========================================
// Lab: Business Logic Flaws
// ビジネスロジックの欠陥
// ========================================

const app = new Hono();

app.route("/vulnerable", vulnerable);
app.route("/secure", secure);

// 商品一覧
app.get("/products", (c) => {
  return c.json({
    products: Object.entries(PRODUCTS).map(([id, p]) => ({ id, ...p })),
  });
});

// リセット
app.post("/reset", (c) => {
  balances.vulnerable = 200000;
  balances.secure = 200000;
  PRODUCTS["1"].stock = 5;
  PRODUCTS["2"].stock = 20;
  PRODUCTS["3"].stock = 10;
  return c.json({ message: "リセットしました" });
});

export default app;
