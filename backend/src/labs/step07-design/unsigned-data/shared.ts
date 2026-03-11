// インメモリセッション（デモ用）
export const sessions = new Map<string, { userId: string; role: string }>();
sessions.set("demo-admin-session", { userId: "1", role: "admin" });
sessions.set("demo-user-session", { userId: "2", role: "user" });

// 商品データベース（サーバー側で価格を管理）
export const PRODUCTS: Record<string, { name: string; price: number }> = {
  "1": { name: "ノートPC", price: 150000 },
  "2": { name: "マウス", price: 3000 },
};
