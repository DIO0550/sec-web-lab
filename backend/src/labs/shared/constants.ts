// ラボ共通定数
// 複数のラボで重複していたマジックナンバーを集約

/** ブルートフォース保護: 最大ログイン試行回数 */
export const MAX_LOGIN_ATTEMPTS = 5;

/** ブルートフォース保護: ロックアウト時間（15分） */
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/** セッション管理: セッションタイムアウト（10秒 — デモ用の短い値） */
export const SESSION_TIMEOUT_MS = 10 * 1000;

/** ファイルアップロード: 最大ファイルサイズ（1MB） */
export const MAX_FILE_SIZE_BYTES = 1024 * 1024;

/** トークン: 有効期限（30分） */
export const TOKEN_EXPIRY_MS = 30 * 60 * 1000;
