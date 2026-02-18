import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getPool } from "./db/pool.js";

// Step01: Recon（偵察）ラボ
import headerLeakage from "./labs/step01-recon/header-leakage.js";
import sensitiveFileExposure from "./labs/step01-recon/sensitive-file-exposure.js";
import errorMessageLeakage from "./labs/step01-recon/error-message-leakage.js";
import directoryListing from "./labs/step01-recon/directory-listing.js";
import headerExposure from "./labs/step01-recon/header-exposure.js";

// Step02: Injection（インジェクション）ラボ
import sqlInjection from "./labs/step02-injection/sql-injection.js";
import xss from "./labs/step02-injection/xss.js";
import commandInjection from "./labs/step02-injection/command-injection.js";
import openRedirect from "./labs/step02-injection/open-redirect.js";

// Step03: Auth（認証）ラボ
import plaintextPassword from "./labs/step03-auth/plaintext-password.js";
import weakHash from "./labs/step03-auth/weak-hash.js";
import bruteForce from "./labs/step03-auth/brute-force.js";
import defaultCredentials from "./labs/step03-auth/default-credentials.js";
import weakPasswordPolicy from "./labs/step03-auth/weak-password-policy.js";

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

// ========================================
// Step02: Injection（インジェクション）ラボ
// ========================================
app.route("/api/labs/sql-injection", sqlInjection);
app.route("/api/labs/xss", xss);
app.route("/api/labs/command-injection", commandInjection);
app.route("/api/labs/open-redirect", openRedirect);

// ========================================
// Step03: Auth（認証）ラボ
// ========================================
app.route("/api/labs/plaintext-password", plaintextPassword);
app.route("/api/labs/weak-hash", weakHash);
app.route("/api/labs/brute-force", bruteForce);
app.route("/api/labs/default-credentials", defaultCredentials);
app.route("/api/labs/weak-password-policy", weakPasswordPolicy);

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
      {
        id: "sql-injection",
        name: "SQLインジェクション",
        category: "step02-injection",
        difficulty: 1,
        path: "/labs/sql-injection",
      },
      {
        id: "xss",
        name: "クロスサイトスクリプティング (XSS)",
        category: "step02-injection",
        difficulty: 1,
        path: "/labs/xss",
      },
      {
        id: "command-injection",
        name: "OSコマンドインジェクション",
        category: "step02-injection",
        difficulty: 2,
        path: "/labs/command-injection",
      },
      {
        id: "open-redirect",
        name: "オープンリダイレクト",
        category: "step02-injection",
        difficulty: 1,
        path: "/labs/open-redirect",
      },
      {
        id: "plaintext-password",
        name: "平文パスワード保存",
        category: "step03-auth",
        difficulty: 1,
        path: "/labs/plaintext-password",
      },
      {
        id: "weak-hash",
        name: "弱いハッシュアルゴリズム",
        category: "step03-auth",
        difficulty: 2,
        path: "/labs/weak-hash",
      },
      {
        id: "brute-force",
        name: "ブルートフォース攻撃",
        category: "step03-auth",
        difficulty: 1,
        path: "/labs/brute-force",
      },
      {
        id: "default-credentials",
        name: "デフォルト認証情報",
        category: "step03-auth",
        difficulty: 1,
        path: "/labs/default-credentials",
      },
      {
        id: "weak-password-policy",
        name: "弱いパスワードポリシー",
        category: "step03-auth",
        difficulty: 1,
        path: "/labs/weak-password-policy",
      },
    ],
  });
});

console.log("Server starting on http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
