# sec-web-lab 学習ロードマップ

ローカル環境 (Hono + React + PostgreSQL) で実験可能な脆弱性を、学習しやすい順番に並べています。
前のステップの知識が後のステップで活きる構成になっているので、上から順に進めるのがおすすめです。

## 凡例

- 難易度: ★☆☆ 入門 / ★★☆ 中級 / ★★★ 上級
- 状態: `未実装` → `実装中` → `完了`

---

## Step 1: 偵察フェーズ — Webアプリの情報を集めよう

> まずは攻撃の前段階。Webアプリが意図せず公開している情報を見つける練習です。
> ブラウザの DevTools だけで試せるものが多く、最初のステップに最適です。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 1 | HTTPヘッダーからの情報漏洩 | ★☆☆ | 未実装 | [header-leakage](step01-recon/header-leakage.md) |
| 2 | 機密ファイル露出 (.git/.env) | ★☆☆ | 未実装 | [sensitive-file-exposure](step01-recon/sensitive-file-exposure.md) |
| 3 | エラーメッセージからの情報漏洩 | ★☆☆ | 未実装 | [error-message-leakage](step01-recon/error-message-leakage.md) |
| 4 | ディレクトリリスティング | ★☆☆ | 未実装 | [directory-listing](step01-recon/directory-listing.md) |
| 5 | 不要なヘッダー露出 | ★☆☆ | 未実装 | [header-exposure](step01-recon/header-exposure.md) |

---

## Step 2: はじめてのインジェクション — 入力を操る基本技術

> Webセキュリティの核心スキル。ユーザー入力がサーバーやブラウザでどう処理されるかを理解し、
> 入力を通じてアプリの挙動を変える方法を学びます。XSS と SQLi は最も重要な脆弱性です。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 6 | Reflected XSS | ★☆☆ | 未実装 | [xss](step02-injection/xss.md) |
| 7 | SQLインジェクション | ★☆☆ | 未実装 | [sql-injection](step02-injection/sql-injection.md) |
| 8 | オープンリダイレクト | ★☆☆ | 未実装 | [open-redirect](step02-injection/open-redirect.md) |
| 9 | Stored XSS | ★★☆ | 未実装 | [xss](step02-injection/xss.md) |
| 10 | DOM-based XSS | ★★☆ | 未実装 | [xss](step02-injection/xss.md) |
| 11 | OSコマンドインジェクション | ★★☆ | 未実装 | [command-injection](step02-injection/command-injection.md) |

---

## Step 3: 認証を突破する — ログインの弱点を知る

> ログイン機能の弱点を学びます。パスワードの保存方法からブルートフォースまで、
> 認証の仕組みと典型的な実装ミスを理解します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 12 | デフォルト認証情報 | ★☆☆ | 未実装 | [default-credentials](step03-auth/default-credentials.md) |
| 13 | 弱いパスワードポリシー | ★☆☆ | 未実装 | [weak-password-policy](step03-auth/weak-password-policy.md) |
| 14 | ブルートフォース攻撃 | ★☆☆ | 未実装 | [brute-force](step03-auth/brute-force.md) |
| 15 | 平文パスワード保存 | ★☆☆ | 未実装 | [plaintext-password](step03-auth/plaintext-password.md) |
| 16 | 弱いハッシュ (MD5/SHA1) | ★★☆ | 未実装 | [weak-hash](step03-auth/weak-hash.md) |

---

## Step 4: セッションを奪う — なりすましの技術

> ログイン後の「セッション」がどう管理されているかを学び、
> Cookie の仕組みや CSRF 攻撃を通じて、なりすましの手法と防御策を体験します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 17 | Cookie操作 | ★☆☆ | 未実装 | [cookie-manipulation](step04-session/cookie-manipulation.md) |
| 18 | セッション固定攻撃 | ★★☆ | 未実装 | [session-fixation](step04-session/session-fixation.md) |
| 19 | セッションハイジャック | ★★☆ | 未実装 | [session-hijacking](step04-session/session-hijacking.md) |
| 20 | CSRF | ★★☆ | 未実装 | [csrf](step04-session/csrf.md) |

---

## Step 5: アクセス制御を突破する — 権限の壁を超える

> 認証は通っているが、本来アクセスできないはずのリソースにアクセスする方法を学びます。
> IDの書き換えやパスの操作で「自分のもの以外」にアクセスする攻撃です。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 21 | IDOR (他ユーザーデータ参照) | ★☆☆ | 未実装 | [idor](step05-access-control/idor.md) |
| 22 | パストラバーサル | ★☆☆ | 未実装 | [path-traversal](step05-access-control/path-traversal.md) |
| 23 | 権限昇格 | ★★☆ | 未実装 | [privilege-escalation](step05-access-control/privilege-escalation.md) |
| 24 | Mass Assignment | ★★☆ | 未実装 | [mass-assignment](step05-access-control/mass-assignment.md) |

---

## Step 6: サーバーサイド攻撃 — サーバーの弱点を突く

> サーバー側の処理を悪用する攻撃を学びます。SSRF やファイルアップロードなど、
> サーバーの内部リソースに到達する手法です。Step 2 のインジェクションの応用編です。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 25 | SSRF | ★★☆ | 未実装 | [ssrf](step06-server-side/ssrf.md) |
| 26 | XXE | ★★☆ | 未実装 | [xxe](step06-server-side/xxe.md) |
| 27 | ファイルアップロード攻撃 | ★★☆ | 未実装 | [file-upload](step06-server-side/file-upload.md) |
| 28 | CRLFインジェクション | ★★☆ | 未実装 | [crlf-injection](step06-server-side/crlf-injection.md) |
| 29 | CORS設定ミス | ★★☆ | 未実装 | [cors-misconfiguration](step06-server-side/cors-misconfiguration.md) |

---

## Step 7: 設計とロジックの問題 — 仕様の穴を見つける

> コードのバグではなく「設計」の問題を学びます。レート制限の欠如やビジネスロジックの欠陥など、
> ツールでは見つけにくい脆弱性を理解します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 30 | レート制限なし | ★☆☆ | 未実装 | [rate-limiting](step07-design/rate-limiting.md) |
| 31 | クリックジャッキング | ★☆☆ | 未実装 | [clickjacking](step07-design/clickjacking.md) |
| 32 | HTTPでの機密データ送信 | ★☆☆ | 未実装 | [sensitive-data-http](step07-design/sensitive-data-http.md) |
| 33 | 不要なHTTPメソッド許可 | ★☆☆ | 未実装 | [http-methods](step07-design/http-methods.md) |
| 34 | 推測可能なパスワードリセット | ★★☆ | 未実装 | [password-reset](step07-design/password-reset.md) |
| 35 | ビジネスロジックの欠陥 | ★★☆ | 未実装 | [business-logic](step07-design/business-logic.md) |
| 36 | 署名なしデータの信頼 | ★★☆ | 未実装 | [unsigned-data](step07-design/unsigned-data.md) |

---

## Step 8: 高度な攻撃テクニック — エキスパートへの道

> ここまでの知識を前提にした上級テクニックです。JWT の改ざんやテンプレートインジェクション、
> レースコンディションなど、実務でも発見が難しい脆弱性に挑戦します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 37 | JWT改ざん | ★★★ | 未実装 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities.md) |
| 38 | JWT alg=none / 弱い鍵 | ★★★ | 未実装 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities.md) |
| 39 | SSTI | ★★★ | 未実装 | [ssti](step08-advanced/ssti.md) |
| 40 | レースコンディション | ★★★ | 未実装 | [race-condition](step08-advanced/race-condition.md) |
| 41 | 安全でないデシリアライゼーション | ★★★ | 未実装 | [deserialization](step08-advanced/deserialization.md) |

---

## Step 9: 守りを固める — ログと例外処理

> 攻撃を学んだ最後に、防御側の視点を強化します。
> 適切なエラーハンドリングとログ記録がなぜ重要なのかを、攻撃者の視点から理解します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 42 | 詳細エラーメッセージ露出 | ★☆☆ | 未実装 | [error-messages](step09-defense/error-messages.md) |
| 43 | スタックトレース漏洩 | ★☆☆ | 未実装 | [stack-trace](step09-defense/stack-trace.md) |
| 44 | ログなし / 不十分なログ | ★☆☆ | 未実装 | [logging](step09-defense/logging.md) |
| 45 | ログインジェクション | ★★☆ | 未実装 | [log-injection](step09-defense/log-injection.md) |
| 46 | Fail-Open | ★★☆ | 未実装 | [fail-open](step09-defense/fail-open.md) |

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
