---
title: 学習ロードマップ
sidebar_position: 1
slug: /
---

# sec-web-lab 学習ロードマップ

ローカル環境 (Hono + React + PostgreSQL) で実験可能な脆弱性を、学習しやすい順番に並べています。
前のステップの知識が後のステップで活きる構成になっているので、上から順に進めるのがおすすめです。

## 凡例

- 難易度: ★☆☆ 入門 / ★★☆ 中級 / ★★★ 上級
- 状態: `未実装` → `実装中` → `完了`

---

## 基礎知識ドキュメント

> ラボに取り組む前に理解しておくべき基礎概念をまとめたドキュメントです。
> 手を動かすラボではなく、読み物として各ステップの前提知識を補います。

| # | トピック | 関連ステップ | ドキュメント |
|---|---------|-------------|-------------|
| F-1 | HTTPの仕組みとセッション管理 | Step 1〜4 の前提 | [http-and-sessions](foundations/http-and-sessions.md) |
| F-2 | 同一オリジンポリシーとCORS | Step 2, 4, 6 の前提 | [same-origin-policy](foundations/same-origin-policy.md) |
| F-3 | 文字エンコーディングとセキュリティ | Step 2 の補足 | [character-encoding](foundations/character-encoding.md) |

---

## Step 1: 偵察フェーズ — Webアプリの情報を集めよう

> まずは攻撃の前段階。Webアプリが意図せず公開している情報を見つける練習です。
> ブラウザの DevTools だけで試せるものが多く、最初のステップに最適です。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 1 | HTTPヘッダーからの情報漏洩 | ★☆☆ | ラボ実装済 | [header-leakage](step01-recon/header-leakage) |
| 2 | 機密ファイル露出 (.git/.env) | ★☆☆ | ラボ実装済 | [sensitive-file-exposure](step01-recon/sensitive-file-exposure) |
| 3 | エラーメッセージからの情報漏洩 | ★☆☆ | ラボ実装済 | [error-message-leakage](step01-recon/error-message-leakage) |
| 4 | ディレクトリリスティング | ★☆☆ | ラボ実装済 | [directory-listing](step01-recon/directory-listing) |
| 5 | 不要なヘッダー露出 | ★☆☆ | ラボ実装済 | [header-exposure](step01-recon/header-exposure) |

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
| 12 | メールヘッダインジェクション | ★★☆ | 未実装 | [mail-header-injection](step02-injection/mail-header-injection.md) |
| 13 | HTTP Parameter Pollution (HPP) | ★★☆ | 未実装 | [hpp](step02-injection/hpp.md) |
| 14 | CSV Injection | ★★☆ | 未実装 | [csv-injection](step02-injection/csv-injection.md) |

---

## Step 3: 認証を突破する — ログインの弱点を知る

> ログイン機能の弱点を学びます。パスワードの保存方法からブルートフォースまで、
> 認証の仕組みと典型的な実装ミスを理解します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 15 | デフォルト認証情報 | ★☆☆ | 未実装 | [default-credentials](step03-auth/default-credentials.md) |
| 16 | 弱いパスワードポリシー | ★☆☆ | 未実装 | [weak-password-policy](step03-auth/weak-password-policy.md) |
| 17 | ブルートフォース攻撃 | ★☆☆ | 未実装 | [brute-force](step03-auth/brute-force.md) |
| 18 | 平文パスワード保存 | ★☆☆ | 未実装 | [plaintext-password](step03-auth/plaintext-password.md) |
| 19 | 弱いハッシュ (MD5/SHA1) | ★★☆ | 未実装 | [weak-hash](step03-auth/weak-hash.md) |
| 20 | ユーザー名列挙 | ★☆☆ | 未実装 | [username-enumeration](step03-auth/username-enumeration.md) |

---

## Step 4: セッションを奪う — なりすましの技術

> ログイン後の「セッション」がどう管理されているかを学び、
> Cookie の仕組みや CSRF 攻撃を通じて、なりすましの手法と防御策を体験します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 21 | Cookie操作 | ★☆☆ | 未実装 | [cookie-manipulation](step04-session/cookie-manipulation.md) |
| 22 | セッション固定攻撃 | ★★☆ | 未実装 | [session-fixation](step04-session/session-fixation.md) |
| 23 | セッションハイジャック | ★★☆ | 未実装 | [session-hijacking](step04-session/session-hijacking.md) |
| 24 | CSRF | ★★☆ | 未実装 | [csrf](step04-session/csrf.md) |
| 25 | トークンリプレイ（失効不備） | ★★☆ | 未実装 | [token-replay](step04-session/token-replay.md) |
| 26 | セッション有効期限の不備 | ★☆☆ | 未実装 | [session-expiration](step04-session/session-expiration.md) |
| 27 | 推測可能なセッションID | ★★☆ | 未実装 | [predictable-session-id](step04-session/predictable-session-id.md) |

---

## Step 5: アクセス制御を突破する — 権限の壁を超える

> 認証は通っているが、本来アクセスできないはずのリソースにアクセスする方法を学びます。
> IDの書き換えやパスの操作で「自分のもの以外」にアクセスする攻撃です。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 28 | IDOR (他ユーザーデータ参照) | ★☆☆ | 未実装 | [idor](step05-access-control/idor.md) |
| 29 | パストラバーサル | ★☆☆ | 未実装 | [path-traversal](step05-access-control/path-traversal.md) |
| 30 | 権限昇格 | ★★☆ | 未実装 | [privilege-escalation](step05-access-control/privilege-escalation.md) |
| 31 | Mass Assignment | ★★☆ | 未実装 | [mass-assignment](step05-access-control/mass-assignment.md) |

---

## Step 6: サーバーサイド攻撃 — サーバーの弱点を突く

> サーバー側の処理を悪用する攻撃を学びます。SSRF やファイルアップロードなど、
> サーバーの内部リソースに到達する手法です。Step 2 のインジェクションの応用編です。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 32 | SSRF | ★★☆ | 未実装 | [ssrf](step06-server-side/ssrf.md) |
| 33 | XXE | ★★☆ | 未実装 | [xxe](step06-server-side/xxe.md) |
| 34 | ファイルアップロード攻撃 | ★★☆ | 未実装 | [file-upload](step06-server-side/file-upload.md) |
| 35 | CRLFインジェクション | ★★☆ | 未実装 | [crlf-injection](step06-server-side/crlf-injection.md) |
| 36 | CORS設定ミス | ★★☆ | 未実装 | [cors-misconfiguration](step06-server-side/cors-misconfiguration.md) |
| 37 | evalインジェクション | ★★☆ | 未実装 | [eval-injection](step06-server-side/eval-injection.md) |
| 38 | SSRFバイパス | ★★★ | 未実装 | [ssrf-bypass](step06-server-side/ssrf-bypass.md) |
| 39 | Zip Slip | ★★☆ | 未実装 | [zip-slip](step06-server-side/zip-slip.md) |

---

## Step 7: 設計とロジックの問題 — 仕様の穴を見つける

> コードのバグではなく「設計」の問題を学びます。レート制限の欠如やビジネスロジックの欠陥など、
> ツールでは見つけにくい脆弱性を理解します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 40 | レート制限なし | ★☆☆ | 未実装 | [rate-limiting](step07-design/rate-limiting.md) |
| 41 | クリックジャッキング | ★☆☆ | 未実装 | [clickjacking](step07-design/clickjacking.md) |
| 42 | HTTPでの機密データ送信 | ★☆☆ | 未実装 | [sensitive-data-http](step07-design/sensitive-data-http.md) |
| 43 | 不要なHTTPメソッド許可 | ★☆☆ | 未実装 | [http-methods](step07-design/http-methods.md) |
| 44 | 推測可能なパスワードリセット | ★★☆ | 未実装 | [password-reset](step07-design/password-reset.md) |
| 45 | ビジネスロジックの欠陥 | ★★☆ | 未実装 | [business-logic](step07-design/business-logic.md) |
| 46 | 署名なしデータの信頼 | ★★☆ | 未実装 | [unsigned-data](step07-design/unsigned-data.md) |
| 47 | セキュリティレスポンスヘッダ未設定 | ★☆☆ | 未実装 | [security-headers](step07-design/security-headers.md) |
| 48 | キャッシュ制御の不備 | ★★☆ | 未実装 | [cache-control](step07-design/cache-control.md) |
| 49 | Web Storageの不適切な使用 | ★★☆ | 未実装 | [web-storage-abuse](step07-design/web-storage-abuse.md) |
| 50 | Host Header Injection | ★★☆ | 未実装 | [host-header-injection](step07-design/host-header-injection.md) |
| 51 | X-Forwarded-For 信頼ミス | ★★☆ | 未実装 | [xff-trust](step07-design/xff-trust.md) |

---

## Step 8: 高度な攻撃テクニック — エキスパートへの道

> ここまでの知識を前提にした上級テクニックです。JWT の改ざんやテンプレートインジェクション、
> レースコンディションなど、実務でも発見が難しい脆弱性に挑戦します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 52 | JWT改ざん | ★★★ | 未実装 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities.md) |
| 53 | JWT alg=none / 弱い鍵 | ★★★ | 未実装 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities.md) |
| 54 | JWT Claim 検証不備 | ★★★ | 未実装 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities.md) |
| 55 | SSTI | ★★★ | 未実装 | [ssti](step08-advanced/ssti.md) |
| 56 | レースコンディション | ★★★ | 未実装 | [race-condition](step08-advanced/race-condition.md) |
| 57 | 安全でないデシリアライゼーション | ★★★ | 未実装 | [deserialization](step08-advanced/deserialization.md) |
| 58 | Prototype Pollution | ★★★ | 未実装 | [prototype-pollution](step08-advanced/prototype-pollution.md) |
| 59 | ReDoS (正規表現DoS) | ★★★ | 未実装 | [redos](step08-advanced/redos.md) |
| 60 | postMessage脆弱性 | ★★★ | 未実装 | [postmessage](step08-advanced/postmessage.md) |
| 61 | Unicode正規化バイパス | ★★★ | 未実装 | [unicode-normalization](step08-advanced/unicode-normalization.md) |

---

## Step 9: 守りを固める — ログ・例外処理・防御設計

> 攻撃を学んだ最後に、防御側の視点を強化します。
> 適切なエラーハンドリングとログ記録がなぜ重要なのかを、攻撃者の視点から理解します。

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 62 | 詳細エラーメッセージ露出 | ★☆☆ | 未実装 | [error-messages](step09-defense/error-messages.md) |
| 63 | スタックトレース漏洩 | ★☆☆ | 未実装 | [stack-trace](step09-defense/stack-trace.md) |
| 64 | ログなし / 不十分なログ | ★☆☆ | 未実装 | [logging](step09-defense/logging.md) |
| 65 | ログインジェクション | ★★☆ | 未実装 | [log-injection](step09-defense/log-injection.md) |
| 66 | Fail-Open | ★★☆ | 未実装 | [fail-open](step09-defense/fail-open.md) |
| 67 | CSP (Content Security Policy) 導入 | ★★☆ | 未実装 | [csp](step09-defense/csp.md) |
| 68 | 入力バリデーション設計 | ★★☆ | 未実装 | [input-validation](step09-defense/input-validation.md) |

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
| OAuth/OIDC 認証フローの脆弱性 | 外部 IdP 連携が必要 (将来追加可能) |
| HTTP/2 固有の脆弱性 | HTTP/2 対応リバースプロキシが必要 |
