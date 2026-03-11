// デモ用商品データ
export const PRODUCTS: Record<string, { name: string; price: number; stock: number }> = {
  "1": { name: "ノートPC", price: 150000, stock: 5 },
  "2": { name: "マウス", price: 3000, stock: 20 },
  "3": { name: "キーボード", price: 8000, stock: 10 },
};

// ユーザー残高（オブジェクトで参照共有）
export const balances = {
  vulnerable: 200000,
  secure: 200000,
};
