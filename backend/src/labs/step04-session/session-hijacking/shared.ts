// インメモリセッションストア（学習目的）
export const sessions = new Map<string, { userId: number; username: string }>();

// インメモリコメントストア（Stored XSS 用）
export type Comment = { id: number; username: string; content: string; createdAt: string };
export let vulnComments: Comment[] = [];
export let secureComments: Comment[] = [];
export let commentIdCounter = 1;

// コメントリセット用のヘルパー
export function resetComments(): void {
  vulnComments = [];
  secureComments = [];
}

// コメントIDカウンターのインクリメント
export function getNextCommentId(): number {
  return commentIdCounter++;
}

// カウンターリセット用
export function resetCommentIdCounter(): void {
  commentIdCounter = 1;
}
