// ログ記録のシミュレーション
export const logEntries: Array<{ timestamp: string; level: string; message: string; mode: string }> = [];

export function addLog(level: string, message: string, mode: string) {
  logEntries.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    mode,
  });
}
