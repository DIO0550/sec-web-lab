// ========================================
// Lab: Race Condition (レースコンディション)
// 同時実行で在庫チェックと在庫更新の間を突く — 共有状態
// ========================================

// デモ用データ
export let vulnStock = 1; // 残り1個
export let secureStock = 1;
export let vulnPurchaseCount = 0;
export let securePurchaseCount = 0;
export let secureLock = false;

// 状態更新用のセッター関数
export function setVulnStock(v: number) { vulnStock = v; }
export function setSecureStock(v: number) { secureStock = v; }
export function setVulnPurchaseCount(v: number) { vulnPurchaseCount = v; }
export function setSecurePurchaseCount(v: number) { securePurchaseCount = v; }
export function setSecureLock(v: boolean) { secureLock = v; }
