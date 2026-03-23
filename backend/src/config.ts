// アプリケーション設定
// 環境変数があればそちらを優先し、なければデフォルト値を使用する

export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
export const SERVER_PORT = Number(process.env.PORT) || 3000;
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://labuser:labpass@localhost:5432/secweblab";
