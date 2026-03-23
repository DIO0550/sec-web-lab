import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getPool } from "./db/pool.js";
import routes from "./routes/index.js";
import { CORS_ORIGIN } from "./config.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: CORS_ORIGIN,
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

// 全ルートを /api 配下に登録
app.route("/api", routes);

export default app;
