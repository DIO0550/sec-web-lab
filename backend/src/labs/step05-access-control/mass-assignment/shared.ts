// ========================================
// Lab: Mass Assignment
// リクエストに余計なフィールドを追加して権限を奪う
// ========================================

// デモ用のインメモリユーザーストア（DBを汚さないため）
export type DemoUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
};

export let nextId = 100;
export const demoUsers: DemoUser[] = [];

export function incrementNextId(): number {
  return nextId++;
}

export function resetDemoData(): void {
  demoUsers.length = 0;
  nextId = 100;
}
