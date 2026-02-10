# sec-web-lab ラボ一覧 & ロードマップ

ローカル環境 (Hono + React + PostgreSQL) で実験可能な脆弱性のみを対象としています。

## 凡例

- 難易度: ★☆☆ 入門 / ★★☆ 中級 / ★★★ 上級
- 状態: `未実装` → `実装中` → `完了`

---

## OWASP Top 10 2025 ベース

### A01: Broken Access Control — アクセス制御の不備

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 1 | IDOR (他ユーザーデータ参照) | ★☆☆ | 未実装 | [a01](owasp/a01-broken-access-control.md) |
| 2 | パストラバーサル | ★☆☆ | 未実装 | [a01](owasp/a01-broken-access-control.md) |
| 3 | 権限昇格 | ★★☆ | 未実装 | [a01](owasp/a01-broken-access-control.md) |
| 4 | CORS設定ミス | ★★☆ | 未実装 | [a01](owasp/a01-broken-access-control.md) |
| 5 | SSRF | ★★☆ | 未実装 | [a01](owasp/a01-broken-access-control.md) |

### A02: Security Misconfiguration — セキュリティ設定ミス

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 6 | デフォルト認証情報 | ★☆☆ | 未実装 | [a02](owasp/a02-security-misconfiguration.md) |
| 7 | 不要なHTTPメソッド許可 | ★☆☆ | 未実装 | [a02](owasp/a02-security-misconfiguration.md) |
| 8 | ディレクトリリスティング | ★☆☆ | 未実装 | [a02](owasp/a02-security-misconfiguration.md) |
| 9 | 詳細エラーメッセージ露出 | ★☆☆ | 未実装 | [a02](owasp/a02-security-misconfiguration.md) |
| 10 | 不要なヘッダー露出 | ★☆☆ | 未実装 | [a02](owasp/a02-security-misconfiguration.md) |

### A04: Cryptographic Failures — 暗号化の不備

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 11 | 平文パスワード保存 | ★☆☆ | 未実装 | [a04](owasp/a04-cryptographic-failures.md) |
| 12 | 弱いハッシュ (MD5/SHA1) | ★★☆ | 未実装 | [a04](owasp/a04-cryptographic-failures.md) |
| 13 | HTTPでの機密データ送信 | ★☆☆ | 未実装 | [a04](owasp/a04-cryptographic-failures.md) |

### A05: Injection — インジェクション

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 14 | SQLインジェクション | ★☆☆ | 未実装 | [a05](owasp/a05-injection.md) |
| 15 | OSコマンドインジェクション | ★★☆ | 未実装 | [a05](owasp/a05-injection.md) |

### A06: Insecure Design — 安全でない設計

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 16 | レート制限なし | ★☆☆ | 未実装 | [a06](owasp/a06-insecure-design.md) |
| 17 | 推測可能なパスワードリセット | ★★☆ | 未実装 | [a06](owasp/a06-insecure-design.md) |
| 18 | ビジネスロジックの欠陥 | ★★☆ | 未実装 | [a06](owasp/a06-insecure-design.md) |

### A07: Identification & Authentication Failures — 認証の不備

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 19 | ブルートフォース攻撃 | ★☆☆ | 未実装 | [a07](owasp/a07-auth-failures.md) |
| 20 | セッション固定攻撃 | ★★☆ | 未実装 | [a07](owasp/a07-auth-failures.md) |
| 21 | 弱いパスワードポリシー | ★☆☆ | 未実装 | [a07](owasp/a07-auth-failures.md) |
| 22 | JWT改ざん | ★★★ | 未実装 | [a07](owasp/a07-auth-failures.md) |

### A08: Software & Data Integrity Failures — 整合性の不備

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 23 | 安全でないデシリアライゼーション | ★★★ | 未実装 | [a08](owasp/a08-data-integrity-failures.md) |
| 24 | 署名なしデータの信頼 | ★★☆ | 未実装 | [a08](owasp/a08-data-integrity-failures.md) |

### A09: Security Logging & Alerting Failures — ログの不備

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 25 | ログなし / 不十分なログ | ★☆☆ | 未実装 | [a09](owasp/a09-logging-failures.md) |
| 26 | ログインジェクション | ★★☆ | 未実装 | [a09](owasp/a09-logging-failures.md) |

### A10: Mishandling of Exceptional Conditions — 例外処理の不備

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 27 | スタックトレース漏洩 | ★☆☆ | 未実装 | [a10](owasp/a10-exceptional-conditions.md) |
| 28 | Fail-Open | ★★☆ | 未実装 | [a10](owasp/a10-exceptional-conditions.md) |

---

## クライアントサイド攻撃

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 29 | Reflected XSS | ★☆☆ | 未実装 | [xss](client-side/xss.md) |
| 30 | Stored XSS | ★★☆ | 未実装 | [xss](client-side/xss.md) |
| 31 | DOM-based XSS | ★★☆ | 未実装 | [xss](client-side/xss.md) |
| 32 | CSRF | ★★☆ | 未実装 | [csrf](client-side/csrf.md) |
| 33 | クリックジャッキング | ★☆☆ | 未実装 | [clickjacking](client-side/clickjacking.md) |
| 34 | オープンリダイレクト | ★☆☆ | 未実装 | [open-redirect](client-side/open-redirect.md) |

---

## サーバーサイド攻撃

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 35 | XXE | ★★☆ | 未実装 | [xxe](server-side/xxe.md) |
| 36 | SSTI | ★★★ | 未実装 | [ssti](server-side/ssti.md) |
| 37 | レースコンディション | ★★★ | 未実装 | [race-condition](server-side/race-condition.md) |
| 38 | CRLFインジェクション | ★★☆ | 未実装 | [crlf](server-side/crlf-injection.md) |
| 39 | ファイルアップロード攻撃 | ★★☆ | 未実装 | [file-upload](server-side/file-upload.md) |

---

## 認証・セッション系

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 40 | セッションハイジャック | ★★☆ | 未実装 | [session-hijacking](auth-session/session-hijacking.md) |
| 41 | Cookie操作 | ★☆☆ | 未実装 | [cookie](auth-session/cookie-manipulation.md) |
| 42 | JWT脆弱性 (alg=none / 弱い鍵) | ★★★ | 未実装 | [jwt](auth-session/jwt-vulnerabilities.md) |

---

## 情報漏洩系

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 43 | HTTPヘッダーからの情報漏洩 | ★☆☆ | 未実装 | [header](info-disclosure/header-leakage.md) |
| 44 | 機密ファイル露出 (.git/.env) | ★☆☆ | 未実装 | [files](info-disclosure/sensitive-file-exposure.md) |
| 45 | エラーメッセージからの情報漏洩 | ★☆☆ | 未実装 | [error](info-disclosure/error-message-leakage.md) |

---

## その他

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 46 | Mass Assignment | ★★☆ | 未実装 | [mass-assignment](other/mass-assignment.md) |

---

## ローカル再現が困難なため除外

以下はインフラ要件が合わないため対象外としています。

| 攻撃 | 除外理由 |
|------|---------|
| NoSQLインジェクション | MongoDB が必要 |
| LDAPインジェクション | LDAPサーバーが必要 |
| HTTPリクエストスマグリング | 特殊なリバースプロキシ構成が必要 |
| Webキャッシュポイズニング | キャッシュプロキシが必要 |
| サブドメインテイクオーバー | DNS制御が必要 |
| GraphQLインジェクション | GraphQLサーバーが必要 (将来追加可能) |
| WebSocketハイジャック | WebSocket構成が別途必要 (将来追加可能) |
| Software Supply Chain Failures | 概念的でローカル攻撃体験が困難 |
