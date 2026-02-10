import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getPool } from "./db/pool.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
  })
);

// ヘルスチェック
app.get("/api/health", async (c) => {
  const pool = getPool();
  try {
    const result = await pool.query("SELECT NOW()");
    return c.json({
      status: "ok",
      db: "connected",
      time: result.rows[0].now,
    });
  } catch (e) {
    return c.json({ status: "error", db: "disconnected" }, 500);
  }
});

// ========================================
// この下に脆弱なエンドポイントを追加していく
// 各ラボ (lab) ごとにルートファイルを分けて管理する
// ========================================

console.log("Server starting on http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
