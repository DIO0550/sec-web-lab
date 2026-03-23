import type { Context } from "hono";

type LabEntry = {
  id: string;
  name: string;
  category: string;
  difficulty: number;
  path: string;
};

// ラボカタログデータ
const LAB_CATALOGUE: LabEntry[] = [
  // Step01: Recon
  { id: "header-leakage", name: "HTTPヘッダー情報漏洩", category: "step01-recon", difficulty: 1, path: "/labs/header-leakage" },
  { id: "sensitive-file-exposure", name: "機密ファイルの露出", category: "step01-recon", difficulty: 1, path: "/labs/sensitive-file-exposure" },
  { id: "error-message-leakage", name: "エラーメッセージ情報漏洩", category: "step01-recon", difficulty: 1, path: "/labs/error-message-leakage" },
  { id: "directory-listing", name: "ディレクトリリスティング", category: "step01-recon", difficulty: 1, path: "/labs/directory-listing" },
  { id: "header-exposure", name: "セキュリティヘッダー欠如", category: "step01-recon", difficulty: 1, path: "/labs/header-exposure" },
  // Step02: Injection
  { id: "sql-injection", name: "SQLインジェクション", category: "step02-injection", difficulty: 1, path: "/labs/sql-injection" },
  { id: "xss", name: "クロスサイトスクリプティング (XSS)", category: "step02-injection", difficulty: 1, path: "/labs/xss" },
  { id: "command-injection", name: "OSコマンドインジェクション", category: "step02-injection", difficulty: 2, path: "/labs/command-injection" },
  { id: "open-redirect", name: "オープンリダイレクト", category: "step02-injection", difficulty: 1, path: "/labs/open-redirect" },
  // Step03: Auth
  { id: "plaintext-password", name: "平文パスワード保存", category: "step03-auth", difficulty: 1, path: "/labs/plaintext-password" },
  { id: "weak-hash", name: "弱いハッシュアルゴリズム", category: "step03-auth", difficulty: 2, path: "/labs/weak-hash" },
  { id: "brute-force", name: "ブルートフォース攻撃", category: "step03-auth", difficulty: 1, path: "/labs/brute-force" },
  { id: "default-credentials", name: "デフォルト認証情報", category: "step03-auth", difficulty: 1, path: "/labs/default-credentials" },
  { id: "weak-password-policy", name: "弱いパスワードポリシー", category: "step03-auth", difficulty: 1, path: "/labs/weak-password-policy" },
  // Step04: Session
  { id: "cookie-manipulation", name: "Cookie属性の不備", category: "step04-session", difficulty: 1, path: "/labs/cookie-manipulation" },
  { id: "session-fixation", name: "セッション固定攻撃", category: "step04-session", difficulty: 2, path: "/labs/session-fixation" },
  { id: "session-hijacking", name: "セッションハイジャック", category: "step04-session", difficulty: 2, path: "/labs/session-hijacking" },
  { id: "csrf", name: "クロスサイトリクエストフォージェリ (CSRF)", category: "step04-session", difficulty: 2, path: "/labs/csrf" },
  // Step05: Access Control
  { id: "idor", name: "IDOR (安全でない直接オブジェクト参照)", category: "step05-access-control", difficulty: 1, path: "/labs/idor" },
  { id: "path-traversal", name: "パストラバーサル", category: "step05-access-control", difficulty: 1, path: "/labs/path-traversal" },
  { id: "privilege-escalation", name: "権限昇格", category: "step05-access-control", difficulty: 2, path: "/labs/privilege-escalation" },
  { id: "mass-assignment", name: "Mass Assignment", category: "step05-access-control", difficulty: 2, path: "/labs/mass-assignment" },
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
];

/** ラボ一覧APIハンドラ */
export function labCatalogueHandler(c: Context) {
  return c.json({ labs: LAB_CATALOGUE });
}
