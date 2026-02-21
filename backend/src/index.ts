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

// Step04: Session（セッション）ラボ
import cookieManipulation from "./labs/step04-session/cookie-manipulation.js";
import sessionFixation from "./labs/step04-session/session-fixation.js";
import sessionHijacking from "./labs/step04-session/session-hijacking.js";
import csrf from "./labs/step04-session/csrf.js";
// Step05: Access Control（アクセス制御）ラボ
import idor from "./labs/step05-access-control/idor.js";
import pathTraversal from "./labs/step05-access-control/path-traversal.js";
import privilegeEscalation from "./labs/step05-access-control/privilege-escalation.js";
import massAssignment from "./labs/step05-access-control/mass-assignment.js";

// Step06: Server-Side Attacks（サーバーサイド攻撃）ラボ
import ssrf from "./labs/step06-server-side/ssrf.js";
import xxe from "./labs/step06-server-side/xxe.js";
import fileUpload from "./labs/step06-server-side/file-upload.js";
import crlfInjection from "./labs/step06-server-side/crlf-injection.js";
import corsMisconfiguration from "./labs/step06-server-side/cors-misconfiguration.js";
import evalInjection from "./labs/step06-server-side/eval-injection.js";

// Step07: Design & Logic（設計とロジックの問題）ラボ
import rateLimiting from "./labs/step07-design/rate-limiting.js";
import clickjacking from "./labs/step07-design/clickjacking.js";
import sensitiveDataHttp from "./labs/step07-design/sensitive-data-http.js";
import httpMethods from "./labs/step07-design/http-methods.js";
import passwordReset from "./labs/step07-design/password-reset.js";
import businessLogic from "./labs/step07-design/business-logic.js";
import unsignedData from "./labs/step07-design/unsigned-data.js";
import securityHeaders from "./labs/step07-design/security-headers.js";
import cacheControl from "./labs/step07-design/cache-control.js";
import webStorageAbuse from "./labs/step07-design/web-storage-abuse.js";

// Step08: Advanced Techniques（高度な攻撃テクニック）ラボ
import jwtVulnerabilities from "./labs/step08-advanced/jwt-vulnerabilities.js";
import ssti from "./labs/step08-advanced/ssti.js";
import raceCondition from "./labs/step08-advanced/race-condition.js";
import deserialization from "./labs/step08-advanced/deserialization.js";
import prototypePollution from "./labs/step08-advanced/prototype-pollution.js";
import redos from "./labs/step08-advanced/redos.js";
import postmessage from "./labs/step08-advanced/postmessage.js";

// Step09: Defense（守りを固める）ラボ
import errorMessages from "./labs/step09-defense/error-messages.js";
import stackTrace from "./labs/step09-defense/stack-trace.js";
import logging from "./labs/step09-defense/logging.js";
import logInjection from "./labs/step09-defense/log-injection.js";
import failOpen from "./labs/step09-defense/fail-open.js";
import csp from "./labs/step09-defense/csp.js";
import inputValidation from "./labs/step09-defense/input-validation.js";

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

// ========================================
// Step04: Session（セッション）ラボ
// ========================================
app.route("/api/labs/cookie-manipulation", cookieManipulation);
app.route("/api/labs/session-fixation", sessionFixation);
app.route("/api/labs/session-hijacking", sessionHijacking);
app.route("/api/labs/csrf", csrf);
// Step05: Access Control（アクセス制御）ラボ
// ========================================
app.route("/api/labs/idor", idor);
app.route("/api/labs/path-traversal", pathTraversal);
app.route("/api/labs/privilege-escalation", privilegeEscalation);
app.route("/api/labs/mass-assignment", massAssignment);

// ========================================
// Step06: Server-Side Attacks（サーバーサイド攻撃）ラボ
// ========================================
app.route("/api/labs/ssrf", ssrf);
app.route("/api/labs/xxe", xxe);
app.route("/api/labs/file-upload", fileUpload);
app.route("/api/labs/crlf-injection", crlfInjection);
app.route("/api/labs/cors-misconfiguration", corsMisconfiguration);
app.route("/api/labs/eval-injection", evalInjection);

// ========================================
// Step07: Design & Logic（設計とロジックの問題）ラボ
// ========================================
app.route("/api/labs/rate-limiting", rateLimiting);
app.route("/api/labs/clickjacking", clickjacking);
app.route("/api/labs/sensitive-data-http", sensitiveDataHttp);
app.route("/api/labs/http-methods", httpMethods);
app.route("/api/labs/password-reset", passwordReset);
app.route("/api/labs/business-logic", businessLogic);
app.route("/api/labs/unsigned-data", unsignedData);
app.route("/api/labs/security-headers", securityHeaders);
app.route("/api/labs/cache-control", cacheControl);
app.route("/api/labs/web-storage-abuse", webStorageAbuse);

// ========================================
// Step08: Advanced Techniques（高度な攻撃テクニック）ラボ
// ========================================
app.route("/api/labs/jwt-vulnerabilities", jwtVulnerabilities);
app.route("/api/labs/ssti", ssti);
app.route("/api/labs/race-condition", raceCondition);
app.route("/api/labs/deserialization", deserialization);
app.route("/api/labs/prototype-pollution", prototypePollution);
app.route("/api/labs/redos", redos);
app.route("/api/labs/postmessage", postmessage);

// ========================================
// Step09: Defense（守りを固める）ラボ
// ========================================
app.route("/api/labs/error-messages", errorMessages);
app.route("/api/labs/stack-trace", stackTrace);
app.route("/api/labs/logging", logging);
app.route("/api/labs/log-injection", logInjection);
app.route("/api/labs/fail-open", failOpen);
app.route("/api/labs/csp", csp);
app.route("/api/labs/input-validation", inputValidation);

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
      {
        id: "cookie-manipulation",
        name: "Cookie属性の不備",
        category: "step04-session",
        difficulty: 1,
        path: "/labs/cookie-manipulation",
      },
      {
        id: "session-fixation",
        name: "セッション固定攻撃",
        category: "step04-session",
        difficulty: 2,
        path: "/labs/session-fixation",
      },
      {
        id: "session-hijacking",
        name: "セッションハイジャック",
        category: "step04-session",
        difficulty: 2,
        path: "/labs/session-hijacking",
      },
      {
        id: "csrf",
        name: "クロスサイトリクエストフォージェリ (CSRF)",
        category: "step04-session",
        difficulty: 2,
        path: "/labs/csrf",
      },
      {
        id: "idor",
        name: "IDOR (安全でない直接オブジェクト参照)",
        category: "step05-access-control",
        difficulty: 1,
        path: "/labs/idor",
      },
      {
        id: "path-traversal",
        name: "パストラバーサル",
        category: "step05-access-control",
        difficulty: 1,
        path: "/labs/path-traversal",
      },
      {
        id: "privilege-escalation",
        name: "権限昇格",
        category: "step05-access-control",
        difficulty: 2,
        path: "/labs/privilege-escalation",
      },
      {
        id: "mass-assignment",
        name: "Mass Assignment",
        category: "step05-access-control",
        difficulty: 2,
        path: "/labs/mass-assignment",
      },
      // Step06: Server-Side Attacks
      { id: "ssrf", name: "SSRF", category: "step06-server-side", difficulty: 2, path: "/labs/ssrf" },
      { id: "xxe", name: "XXE", category: "step06-server-side", difficulty: 2, path: "/labs/xxe" },
      { id: "file-upload", name: "ファイルアップロード攻撃", category: "step06-server-side", difficulty: 2, path: "/labs/file-upload" },
      { id: "crlf-injection", name: "CRLFインジェクション", category: "step06-server-side", difficulty: 2, path: "/labs/crlf-injection" },
      { id: "cors-misconfiguration", name: "CORS設定ミス", category: "step06-server-side", difficulty: 2, path: "/labs/cors-misconfiguration" },
      { id: "eval-injection", name: "evalインジェクション", category: "step06-server-side", difficulty: 2, path: "/labs/eval-injection" },
      // Step07: Design & Logic
      { id: "rate-limiting", name: "レート制限なし", category: "step07-design", difficulty: 1, path: "/labs/rate-limiting" },
      { id: "clickjacking", name: "クリックジャッキング", category: "step07-design", difficulty: 1, path: "/labs/clickjacking" },
      { id: "sensitive-data-http", name: "HTTPでの機密データ送信", category: "step07-design", difficulty: 1, path: "/labs/sensitive-data-http" },
      { id: "http-methods", name: "不要なHTTPメソッド許可", category: "step07-design", difficulty: 1, path: "/labs/http-methods" },
      { id: "password-reset", name: "推測可能なパスワードリセット", category: "step07-design", difficulty: 2, path: "/labs/password-reset" },
      { id: "business-logic", name: "ビジネスロジックの欠陥", category: "step07-design", difficulty: 2, path: "/labs/business-logic" },
      { id: "unsigned-data", name: "署名なしデータの信頼", category: "step07-design", difficulty: 2, path: "/labs/unsigned-data" },
      { id: "security-headers", name: "セキュリティヘッダー未設定", category: "step07-design", difficulty: 1, path: "/labs/security-headers" },
      { id: "cache-control", name: "キャッシュ制御の不備", category: "step07-design", difficulty: 1, path: "/labs/cache-control" },
      { id: "web-storage-abuse", name: "Web Storageの不適切な使用", category: "step07-design", difficulty: 2, path: "/labs/web-storage-abuse" },
      // Step08: Advanced Techniques
      { id: "jwt-vulnerabilities", name: "JWT脆弱性", category: "step08-advanced", difficulty: 3, path: "/labs/jwt-vulnerabilities" },
      { id: "ssti", name: "SSTI", category: "step08-advanced", difficulty: 3, path: "/labs/ssti" },
      { id: "race-condition", name: "レースコンディション", category: "step08-advanced", difficulty: 3, path: "/labs/race-condition" },
      { id: "deserialization", name: "安全でないデシリアライゼーション", category: "step08-advanced", difficulty: 3, path: "/labs/deserialization" },
      { id: "prototype-pollution", name: "Prototype Pollution", category: "step08-advanced", difficulty: 3, path: "/labs/prototype-pollution" },
      { id: "redos", name: "ReDoS", category: "step08-advanced", difficulty: 2, path: "/labs/redos" },
      { id: "postmessage", name: "postMessage脆弱性", category: "step08-advanced", difficulty: 2, path: "/labs/postmessage" },
      // Step09: Defense
      { id: "error-messages", name: "詳細エラーメッセージ露出", category: "step09-defense", difficulty: 1, path: "/labs/error-messages" },
      { id: "stack-trace", name: "スタックトレース漏洩", category: "step09-defense", difficulty: 1, path: "/labs/stack-trace" },
      { id: "logging", name: "不適切なログ記録", category: "step09-defense", difficulty: 1, path: "/labs/logging" },
      { id: "log-injection", name: "ログインジェクション", category: "step09-defense", difficulty: 2, path: "/labs/log-injection" },
      { id: "fail-open", name: "Fail-Open", category: "step09-defense", difficulty: 2, path: "/labs/fail-open" },
      { id: "csp", name: "CSP", category: "step09-defense", difficulty: 2, path: "/labs/csp" },
      { id: "input-validation", name: "入力バリデーション設計", category: "step09-defense", difficulty: 1, path: "/labs/input-validation" },
    ],
  });
});

console.log("Server starting on http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
