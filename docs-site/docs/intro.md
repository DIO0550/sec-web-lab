---
title: 学習ロードマップ
sidebar_position: 1
slug: /
---

# sec-web-lab 学習ロードマップ

ローカル環境 (Hono + React + PostgreSQL) で実験可能な脆弱性を、学習しやすい順番に並べています。
前のステップの知識が後のステップで活きる構成になっているので、上から順に進めるのがおすすめです。

<div class="roadmap">
  <a class="roadmap-step" href="#step-1-偵察フェーズ--webアプリの情報を集めよう" style={{"--step-color":"#3b82f6"}}>
    <span class="roadmap-step__badge roadmap-step__badge--start">START</span>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">01</span>
      <span class="roadmap-step__title">偵察フェーズ</span>
    </span>
    <span class="roadmap-step__desc">Webアプリの情報を集める</span>
    <span class="roadmap-step__meta">★☆☆ 入門 · 5 ラボ</span>
  </a>
  <a class="roadmap-step" href="#step-2-はじめてのインジェクション--入力を操る基本技術" style={{"--step-color":"#ef4444"}}>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">02</span>
      <span class="roadmap-step__title">インジェクション</span>
    </span>
    <span class="roadmap-step__desc">入力を操る基本技術</span>
    <span class="roadmap-step__meta">★☆☆〜★★☆ · 9 ラボ</span>
  </a>
  <a class="roadmap-step" href="#step-3-認証を突破する--ログインの弱点を知る" style={{"--step-color":"#f59e0b"}}>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">03</span>
      <span class="roadmap-step__title">認証突破</span>
    </span>
    <span class="roadmap-step__desc">ログインの弱点を知る</span>
    <span class="roadmap-step__meta">★☆☆〜★★☆ · 6 ラボ</span>
  </a>
  <div class="roadmap-arrow-row roadmap-arrow-row--right">
    <span class="roadmap-arrow-row__icon"><span class="roadmap-arrow-row__line"></span><span class="roadmap-arrow-row__chevron">&#9660;</span></span>
  </div>
  <a class="roadmap-step" href="#step-6-サーバーサイド攻撃--サーバーの弱点を突く" style={{"--step-color":"#06b6d4"}}>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">06</span>
      <span class="roadmap-step__title">サーバーサイド攻撃</span>
    </span>
    <span class="roadmap-step__desc">サーバーの弱点を突く</span>
    <span class="roadmap-step__meta">★★☆〜★★★ · 8 ラボ</span>
  </a>
  <a class="roadmap-step" href="#step-5-アクセス制御を突破する--権限の壁を超える" style={{"--step-color":"#ec4899"}}>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">05</span>
      <span class="roadmap-step__title">アクセス制御突破</span>
    </span>
    <span class="roadmap-step__desc">権限の壁を超える</span>
    <span class="roadmap-step__meta">★☆☆〜★★☆ · 4 ラボ</span>
  </a>
  <a class="roadmap-step" href="#step-4-セッションを奪う--なりすましの技術" style={{"--step-color":"#8b5cf6"}}>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">04</span>
      <span class="roadmap-step__title">セッション奪取</span>
    </span>
    <span class="roadmap-step__desc">なりすましの技術</span>
    <span class="roadmap-step__meta">★☆☆〜★★☆ · 7 ラボ</span>
  </a>
  <div class="roadmap-arrow-row roadmap-arrow-row--left">
    <span class="roadmap-arrow-row__icon"><span class="roadmap-arrow-row__line"></span><span class="roadmap-arrow-row__chevron">&#9660;</span></span>
  </div>
  <a class="roadmap-step" href="#step-7-設計とロジックの問題--仕様の穴を見つける" style={{"--step-color":"#84cc16"}}>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">07</span>
      <span class="roadmap-step__title">設計とロジックの問題</span>
    </span>
    <span class="roadmap-step__desc">仕様の穴を見つける</span>
    <span class="roadmap-step__meta">★☆☆〜★★☆ · 12 ラボ</span>
  </a>
  <a class="roadmap-step" href="#step-8-高度な攻撃テクニック--エキスパートへの道" style={{"--step-color":"#f97316"}}>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">08</span>
      <span class="roadmap-step__title">高度な攻撃テクニック</span>
    </span>
    <span class="roadmap-step__desc">エキスパートへの道</span>
    <span class="roadmap-step__meta">★★★ 上級 · 10 ラボ</span>
  </a>
  <a class="roadmap-step" href="#step-9-守りを固める--ログ例外処理防御設計" style={{"--step-color":"#22c55e"}}>
    <span class="roadmap-step__badge roadmap-step__badge--goal">GOAL</span>
    <span class="roadmap-step__header">
      <span class="roadmap-step__number">09</span>
      <span class="roadmap-step__title">守りを固める</span>
    </span>
    <span class="roadmap-step__desc">ログ・例外処理・防御設計</span>
    <span class="roadmap-step__meta">★☆☆〜★★☆ · 7 ラボ</span>
  </a>
  <div class="roadmap-footer">全 68 ラボ ｜ 入門から上級まで段階的に学習</div>
</div>

## 凡例

| 難易度 | レベル | 対象者 |
|--------|--------|--------|
| ★☆☆ | 入門 | Web開発の基本がわかる人 |
| ★★☆ | 中級 | Step 1〜3 を終えた人 |
| ★★★ | 上級 | セキュリティの基礎を理解した人 |

- 状態: `未実装` → `実装中` → `ラボ実装済`

---

## 攻撃カテゴリマップ

> 68のラボは大きく4つのカテゴリに分類できます。
> ステップ順に学ぶのが基本ですが、興味のあるカテゴリから探すこともできます。

<div class="category-map">
  <div class="category-card" style={{"--cat-color":"#ef4444"}}>
    <div class="category-card__header">
      <span class="category-card__icon">&#9000;</span>
      <span class="category-card__title">入力操作系</span>
      <span class="category-card__subtitle">Input Manipulation</span>
      <span class="category-card__badge">15 ラボ</span>
    </div>
    <div class="category-card__steps">主に Step 2, 6, 8</div>
    <hr class="category-card__divider" />
    <ul class="category-card__labs">
      <li>Reflected XSS</li>
      <li>CSVインジェクション</li>
      <li>Stored XSS</li>
      <li>evalインジェクション</li>
      <li>DOM-based XSS</li>
      <li>SSTI</li>
      <li>SQLインジェクション</li>
      <li>オープンリダイレクト</li>
      <li>OSコマンドインジェクション</li>
      <li>Prototype Pollution</li>
      <li>メールヘッダインジェクション</li>
      <li>Unicode正規化バイパス</li>
      <li>CRLFインジェクション</li>
      <li>ReDoS</li>
      <li>HPP</li>
    </ul>
  </div>
  <div class="category-card" style={{"--cat-color":"#8b5cf6"}}>
    <div class="category-card__header">
      <span class="category-card__icon">&#9919;</span>
      <span class="category-card__title">認証・セッション系</span>
      <span class="category-card__subtitle">Auth &amp; Session</span>
      <span class="category-card__badge">18 ラボ</span>
    </div>
    <div class="category-card__steps">主に Step 3, 4, 8</div>
    <hr class="category-card__divider" />
    <ul class="category-card__labs">
      <li>デフォルト認証情報</li>
      <li>セッションハイジャック</li>
      <li>弱いパスワードポリシー</li>
      <li>CSRF</li>
      <li>ブルートフォース攻撃</li>
      <li>トークンリプレイ</li>
      <li>平文パスワード保存</li>
      <li>セッション有効期限の不備</li>
      <li>弱いハッシュ (MD5/SHA1)</li>
      <li>推測可能なセッションID</li>
      <li>ユーザー名列挙</li>
      <li>JWT改ざん</li>
      <li>Cookie操作</li>
      <li>JWT alg=none / 弱い鍵</li>
      <li>セッション固定攻撃</li>
      <li>JWT Claim 検証不備</li>
    </ul>
  </div>
  <div class="category-card" style={{"--cat-color":"#f59e0b"}}>
    <div class="category-card__header">
      <span class="category-card__icon">&#9881;</span>
      <span class="category-card__title">設定・設計系</span>
      <span class="category-card__subtitle">Config &amp; Design</span>
      <span class="category-card__badge">17 ラボ</span>
    </div>
    <div class="category-card__steps">主に Step 1, 7</div>
    <hr class="category-card__divider" />
    <ul class="category-card__labs">
      <li>HTTPヘッダー情報漏洩</li>
      <li>不要なHTTPメソッド許可</li>
      <li>機密ファイル露出</li>
      <li>キャッシュ制御の不備</li>
      <li>エラーメッセージ漏洩</li>
      <li>Web Storageの不適切な使用</li>
      <li>ディレクトリリスティング</li>
      <li>Host Header Injection</li>
      <li>不要なヘッダー露出</li>
      <li>X-Forwarded-For 信頼ミス</li>
      <li>セキュリティヘッダ未設定</li>
      <li>レート制限なし</li>
      <li>クリックジャッキング</li>
      <li>推測可能なパスワードリセット</li>
      <li>HTTPでの機密データ送信</li>
      <li>署名なしデータの信頼</li>
    </ul>
  </div>
  <div class="category-card" style={{"--cat-color":"#06b6d4"}}>
    <div class="category-card__header">
      <span class="category-card__icon">&#9874;</span>
      <span class="category-card__title">サーバーサイド系</span>
      <span class="category-card__subtitle">Server-Side</span>
      <span class="category-card__badge">18 ラボ</span>
    </div>
    <div class="category-card__steps">主に Step 5, 6, 8, 9</div>
    <hr class="category-card__divider" />
    <ul class="category-card__labs">
      <li>SSRF</li>
      <li>Zip Slip</li>
      <li>SSRFバイパス</li>
      <li>CORS設定ミス</li>
      <li>XXE</li>
      <li>レースコンディション</li>
      <li>ファイルアップロード攻撃</li>
      <li>デシリアライゼーション</li>
      <li>IDOR</li>
      <li>ビジネスロジックの欠陥</li>
      <li>パストラバーサル</li>
      <li>Fail-Open</li>
      <li>権限昇格</li>
      <li>詳細エラーメッセージ露出</li>
      <li>Mass Assignment</li>
      <li>ログ不足 / ログインジェクション</li>
    </ul>
  </div>
</div>

---

## 基礎知識ドキュメント

> ラボに取り組む前に理解しておくべき基礎概念をまとめたドキュメントです。
> 手を動かすラボではなく、読み物として各ステップの前提知識を補います。

| # | トピック | 関連ステップ | ドキュメント |
|---|---------|-------------|-------------|
| F-1 | HTTPの基礎 | Step 1 の前提 | [http-basics](foundations/protocol/http-basics.md) |
| F-2 | URLエンコーディングとReferer | Step 1 の前提 | [url-encoding](foundations/protocol/url-encoding.md) |
| F-3 | 同一オリジンポリシー | Step 2, 4 の前提 | [same-origin-policy](foundations/browser/same-origin-policy.md) |
| F-4 | CORSの仕組み | Step 6 の前提 | [cors](foundations/browser/cors.md) |
| F-5 | 認証の基礎 | Step 3 の前提 | [authentication](foundations/auth-session/authentication.md) |
| F-6 | セッション管理の基礎 | Step 4 の前提 | [session-management](foundations/auth-session/session-management.md) |
| F-7 | 暗号化・ハッシュの基礎 | Step 3, 8 の前提 | [crypto-basics](foundations/crypto/crypto-basics.md) |
| F-8 | JavaScript・DOMの基礎 | Step 2, 8 の前提 | [js-dom-basics](foundations/js-dom/js-dom-basics.md) |
| F-9 | 入力処理の基礎 | Step 2 の前提 | [input-basics](foundations/input-handling/input-basics.md) |
| F-10 | 文字エンコーディングとセキュリティ | Step 2 の補足 | [character-encoding](foundations/input-handling/character-encoding.md) |

---

## Step 1: 偵察フェーズ — Webアプリの情報を集めよう

> まずは攻撃の前段階。Webアプリが意図せず公開している情報を見つける練習です。
> ブラウザの DevTools だけで試せるものが多く、最初のステップに最適です。

![Step 1 概要](diagrams/step01-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 1 | HTTPヘッダーからの情報漏洩 | ★☆☆ | ラボ実装済 | [header-leakage](step01-recon/header-leakage/header-leakage.mdx) |
| 2 | 機密ファイル露出 (.git/.env) | ★☆☆ | ラボ実装済 | [sensitive-file-exposure](step01-recon/sensitive-file-exposure/sensitive-file-exposure.mdx) |
| 3 | エラーメッセージからの情報漏洩 | ★☆☆ | ラボ実装済 | [error-message-leakage](step01-recon/error-message-leakage/error-message-leakage.mdx) |
| 4 | ディレクトリリスティング | ★☆☆ | ラボ実装済 | [directory-listing](step01-recon/directory-listing/directory-listing.mdx) |
| 5 | 不要なヘッダー露出 | ★☆☆ | ラボ実装済 | [header-exposure](step01-recon/header-exposure/header-exposure.mdx) |

---

## Step 2: はじめてのインジェクション — 入力を操る基本技術

> Webセキュリティの核心スキル。ユーザー入力がサーバーやブラウザでどう処理されるかを理解し、
> 入力を通じてアプリの挙動を変える方法を学びます。XSS と SQLi は最も重要な脆弱性です。

![Step 2 概要](diagrams/step02-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 6 | Reflected XSS | ★☆☆ | ラボ実装済 | [xss](step02-injection/xss/xss.mdx) |
| 7 | SQLインジェクション | ★☆☆ | ラボ実装済 | [sql-injection](step02-injection/sql-injection/sql-injection.mdx) |
| 8 | オープンリダイレクト | ★☆☆ | ラボ実装済 | [open-redirect](step02-injection/open-redirect/open-redirect.mdx) |
| 9 | Stored XSS | ★★☆ | ラボ実装済 | [xss](step02-injection/xss/xss.mdx) |
| 10 | DOM-based XSS | ★★☆ | 未実装 | [xss](step02-injection/xss/xss.mdx) |
| 11 | OSコマンドインジェクション | ★★☆ | ラボ実装済 | [command-injection](step02-injection/command-injection/command-injection.mdx) |
| 12 | メールヘッダインジェクション | ★★☆ | ラボ実装済 | [mail-header-injection](step02-injection/mail-header-injection/mail-header-injection.mdx) |
| 13 | HTTP Parameter Pollution (HPP) | ★★☆ | ラボ実装済 | [hpp](step02-injection/hpp/hpp.mdx) |
| 14 | CSV Injection | ★★☆ | ラボ実装済 | [csv-injection](step02-injection/csv-injection/csv-injection.mdx) |

---

## Step 3: 認証を突破する — ログインの弱点を知る

> ログイン機能の弱点を学びます。パスワードの保存方法からブルートフォースまで、
> 認証の仕組みと典型的な実装ミスを理解します。

![Step 3 概要](diagrams/step03-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 15 | デフォルト認証情報 | ★☆☆ | ラボ実装済 | [default-credentials](step03-auth/default-credentials/default-credentials.mdx) |
| 16 | 弱いパスワードポリシー | ★☆☆ | ラボ実装済 | [weak-password-policy](step03-auth/weak-password-policy/weak-password-policy.mdx) |
| 17 | ブルートフォース攻撃 | ★☆☆ | ラボ実装済 | [brute-force](step03-auth/brute-force/brute-force.mdx) |
| 18 | 平文パスワード保存 | ★☆☆ | ラボ実装済 | [plaintext-password](step03-auth/plaintext-password/plaintext-password.mdx) |
| 19 | 弱いハッシュ (MD5/SHA1) | ★★☆ | ラボ実装済 | [weak-hash](step03-auth/weak-hash/weak-hash.mdx) |
| 20 | ユーザー名列挙 | ★☆☆ | ラボ実装済 | [username-enumeration](step03-auth/username-enumeration/username-enumeration.mdx) |

---

## Step 4: セッションを奪う — なりすましの技術

> ログイン後の「セッション」がどう管理されているかを学び、
> Cookie の仕組みや CSRF 攻撃を通じて、なりすましの手法と防御策を体験します。

![Step 4 概要](diagrams/step04-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 21 | Cookie操作 | ★☆☆ | ラボ実装済 | [cookie-manipulation](step04-session/cookie-manipulation/cookie-manipulation.mdx) |
| 22 | セッション固定攻撃 | ★★☆ | ラボ実装済 | [session-fixation](step04-session/session-fixation/session-fixation.mdx) |
| 23 | セッションハイジャック | ★★☆ | ラボ実装済 | [session-hijacking](step04-session/session-hijacking/session-hijacking.mdx) |
| 24 | CSRF | ★★☆ | ラボ実装済 | [csrf](step04-session/csrf/csrf.mdx) |
| 25 | トークンリプレイ（失効不備） | ★★☆ | ラボ実装済 | [token-replay](step04-session/token-replay/token-replay.mdx) |
| 26 | セッション有効期限の不備 | ★☆☆ | ラボ実装済 | [session-expiration](step04-session/session-expiration/session-expiration.mdx) |
| 27 | 推測可能なセッションID | ★★☆ | ラボ実装済 | [predictable-session-id](step04-session/predictable-session-id/predictable-session-id.mdx) |

---

## Step 5: アクセス制御を突破する — 権限の壁を超える

> 認証は通っているが、本来アクセスできないはずのリソースにアクセスする方法を学びます。
> IDの書き換えやパスの操作で「自分のもの以外」にアクセスする攻撃です。

![Step 5 概要](diagrams/step05-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 28 | IDOR (他ユーザーデータ参照) | ★☆☆ | ラボ実装済 | [idor](step05-access-control/idor/idor.mdx) |
| 29 | パストラバーサル | ★☆☆ | ラボ実装済 | [path-traversal](step05-access-control/path-traversal/path-traversal.mdx) |
| 30 | 権限昇格 | ★★☆ | ラボ実装済 | [privilege-escalation](step05-access-control/privilege-escalation/privilege-escalation.mdx) |
| 31 | Mass Assignment | ★★☆ | ラボ実装済 | [mass-assignment](step05-access-control/mass-assignment/mass-assignment.mdx) |

---

## Step 6: サーバーサイド攻撃 — サーバーの弱点を突く

> サーバー側の処理を悪用する攻撃を学びます。SSRF やファイルアップロードなど、
> サーバーの内部リソースに到達する手法です。Step 2 のインジェクションの応用編です。

![Step 6 概要](diagrams/step06-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 32 | SSRF | ★★☆ | ラボ実装済 | [ssrf](step06-server-side/ssrf/ssrf.mdx) |
| 33 | XXE | ★★☆ | ラボ実装済 | [xxe](step06-server-side/xxe/xxe.mdx) |
| 34 | ファイルアップロード攻撃 | ★★☆ | ラボ実装済 | [file-upload](step06-server-side/file-upload/file-upload.mdx) |
| 35 | CRLFインジェクション | ★★☆ | ラボ実装済 | [crlf-injection](step06-server-side/crlf-injection/crlf-injection.mdx) |
| 36 | CORS設定ミス | ★★☆ | ラボ実装済 | [cors-misconfiguration](step06-server-side/cors-misconfiguration/cors-misconfiguration.mdx) |
| 37 | evalインジェクション | ★★☆ | ラボ実装済 | [eval-injection](step06-server-side/eval-injection/eval-injection.mdx) |
| 38 | SSRFバイパス | ★★★ | ラボ実装済 | [ssrf-bypass](step06-server-side/ssrf-bypass/ssrf-bypass.mdx) |
| 39 | Zip Slip | ★★☆ | ラボ実装済 | [zip-slip](step06-server-side/zip-slip/zip-slip.mdx) |

---

## Step 7: 設計とロジックの問題 — 仕様の穴を見つける

> コードのバグではなく「設計」の問題を学びます。レート制限の欠如やビジネスロジックの欠陥など、
> ツールでは見つけにくい脆弱性を理解します。

![Step 7 概要](diagrams/step07-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 40 | レート制限なし | ★☆☆ | ラボ実装済 | [rate-limiting](step07-design/rate-limiting/rate-limiting.mdx) |
| 41 | クリックジャッキング | ★☆☆ | ラボ実装済 | [clickjacking](step07-design/clickjacking/clickjacking.mdx) |
| 42 | HTTPでの機密データ送信 | ★☆☆ | ラボ実装済 | [sensitive-data-http](step07-design/sensitive-data-http/sensitive-data-http.mdx) |
| 43 | 不要なHTTPメソッド許可 | ★☆☆ | ラボ実装済 | [http-methods](step07-design/http-methods/http-methods.mdx) |
| 44 | 推測可能なパスワードリセット | ★★☆ | ラボ実装済 | [password-reset](step07-design/password-reset/password-reset.mdx) |
| 45 | ビジネスロジックの欠陥 | ★★☆ | ラボ実装済 | [business-logic](step07-design/business-logic/business-logic.mdx) |
| 46 | 署名なしデータの信頼 | ★★☆ | ラボ実装済 | [unsigned-data](step07-design/unsigned-data/unsigned-data.mdx) |
| 47 | セキュリティレスポンスヘッダ未設定 | ★☆☆ | ラボ実装済 | [security-headers](step07-design/security-headers/security-headers.mdx) |
| 48 | キャッシュ制御の不備 | ★★☆ | ラボ実装済 | [cache-control](step07-design/cache-control/cache-control.mdx) |
| 49 | Web Storageの不適切な使用 | ★★☆ | ラボ実装済 | [web-storage-abuse](step07-design/web-storage-abuse/web-storage-abuse.mdx) |
| 50 | Host Header Injection | ★★☆ | ラボ実装済 | [host-header-injection](step07-design/host-header-injection/host-header-injection.mdx) |
| 51 | X-Forwarded-For 信頼ミス | ★★☆ | ラボ実装済 | [xff-trust](step07-design/xff-trust/xff-trust.mdx) |

---

## Step 8: 高度な攻撃テクニック — エキスパートへの道

> ここまでの知識を前提にした上級テクニックです。JWT の改ざんやテンプレートインジェクション、
> レースコンディションなど、実務でも発見が難しい脆弱性に挑戦します。

![Step 8 概要](diagrams/step08-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 52 | JWT改ざん | ★★★ | ラボ実装済 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities/jwt-vulnerabilities.mdx) |
| 53 | JWT alg=none / 弱い鍵 | ★★★ | ラボ実装済 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities/jwt-vulnerabilities.mdx) |
| 54 | JWT Claim 検証不備 | ★★★ | ラボ実装済 | [jwt-vulnerabilities](step08-advanced/jwt-vulnerabilities/jwt-vulnerabilities.mdx) |
| 55 | SSTI | ★★★ | ラボ実装済 | [ssti](step08-advanced/ssti/ssti.mdx) |
| 56 | レースコンディション | ★★★ | ラボ実装済 | [race-condition](step08-advanced/race-condition/race-condition.mdx) |
| 57 | 安全でないデシリアライゼーション | ★★★ | ラボ実装済 | [deserialization](step08-advanced/deserialization/deserialization.mdx) |
| 58 | Prototype Pollution | ★★★ | ラボ実装済 | [prototype-pollution](step08-advanced/prototype-pollution/prototype-pollution.mdx) |
| 59 | ReDoS (正規表現DoS) | ★★★ | ラボ実装済 | [redos](step08-advanced/redos/redos.mdx) |
| 60 | postMessage脆弱性 | ★★★ | ラボ実装済 | [postmessage](step08-advanced/postmessage/postmessage.mdx) |
| 61 | Unicode正規化バイパス | ★★★ | ラボ実装済 | [unicode-normalization](step08-advanced/unicode-normalization/unicode-normalization.mdx) |

---

## Step 9: 守りを固める — ログ・例外処理・防御設計

> 攻撃を学んだ最後に、防御側の視点を強化します。
> 適切なエラーハンドリングとログ記録がなぜ重要なのかを、攻撃者の視点から理解します。

![Step 9 概要](diagrams/step09-overview.svg)

| # | ラボ名 | 難易度 | 状態 | ドキュメント |
|---|--------|--------|------|-------------|
| 62 | 詳細エラーメッセージ露出 | ★☆☆ | ラボ実装済 | [error-messages](step09-defense/error-messages/error-messages.mdx) |
| 63 | スタックトレース漏洩 | ★☆☆ | ラボ実装済 | [stack-trace](step09-defense/stack-trace/stack-trace.mdx) |
| 64 | ログなし / 不十分なログ | ★☆☆ | ラボ実装済 | [logging](step09-defense/logging/logging.mdx) |
| 65 | ログインジェクション | ★★☆ | ラボ実装済 | [log-injection](step09-defense/log-injection/log-injection.mdx) |
| 66 | Fail-Open | ★★☆ | ラボ実装済 | [fail-open](step09-defense/fail-open/fail-open.mdx) |
| 67 | CSP (Content Security Policy) 導入 | ★★☆ | ラボ実装済 | [csp](step09-defense/csp/csp.mdx) |
| 68 | 入力バリデーション設計 | ★★☆ | ラボ実装済 | [input-validation](step09-defense/input-validation/input-validation.mdx) |

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
