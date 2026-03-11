export const logEntries: Array<{ timestamp: string; message: string; mode: string }> = [];

export function addLog(message: string, mode: string) {
  logEntries.push({
    timestamp: new Date().toISOString(),
    message,
    mode,
  });
}
