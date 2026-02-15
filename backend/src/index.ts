import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getPool } from "./db/pool.js";

// Step01: Recon（偵察）ラボ
import headerLeakage from "./labs/header-leakage.js";
import sensitiveFileExposure from "./labs/sensitive-file-exposure.js";
import errorMessageLeakage from "./labs/error-message-leakage.js";
import directoryListing from "./labs/directory-listing.js";
import headerExposure from "./labs/header-exposure.js";

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
// Step01: Recon（偵察）ラボ
// ========================================
app.route("/api/labs/header-leakage", headerLeakage);
app.route("/api/labs/sensitive-file-exposure", sensitiveFileExposure);
app.route("/api/labs/error-message-leakage", errorMessageLeakage);
app.route("/api/labs/directory-listing", directoryListing);
app.route("/api/labs/header-exposure", headerExposure);

// ラボ一覧API
app.get("/api/labs", (c) => {
  return c.json({
    labs: [
      {
        id: "header-leakage",
        name: "HTTPヘッダー情報漏洩",
        category: "step01-recon",
        difficulty: 1,
        path: "/labs/header-leakage",
      },
      {
        id: "sensitive-file-exposure",
        name: "機密ファイルの露出",
        category: "step01-recon",
        difficulty: 1,
        path: "/labs/sensitive-file-exposure",
      },
      {
        id: "error-message-leakage",
        name: "エラーメッセージ情報漏洩",
        category: "step01-recon",
        difficulty: 1,
        path: "/labs/error-message-leakage",
      },
      {
        id: "directory-listing",
        name: "ディレクトリリスティング",
        category: "step01-recon",
        difficulty: 1,
        path: "/labs/directory-listing",
      },
      {
        id: "header-exposure",
        name: "セキュリティヘッダー欠如",
        category: "step01-recon",
        difficulty: 1,
        path: "/labs/header-exposure",
      },
    ],
  });
});

console.log("Server starting on http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
