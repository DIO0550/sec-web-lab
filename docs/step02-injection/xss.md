# XSS (Cross-Site Scripting) — クロスサイトスクリプティング

## 対象ラボ

### 1. Reflected XSS

- **概要**: URLパラメータの値がそのままHTMLに反映され、スクリプトが実行される
- **攻撃例**: `/search?q=<script>alert(document.cookie)</script>`
- **技術スタック**: Hono API (HTMLレスポンス)
- **難易度**: ★☆☆
- **優先度**: 最優先

### 2. Stored XSS

- **概要**: 投稿内容にスクリプトを埋め込み、他ユーザーの閲覧時に実行される
- **攻撃例**: 掲示板に `<img src=x onerror=alert(1)>` を投稿
- **技術スタック**: Hono API + PostgreSQL + React
- **難易度**: ★★☆
- **優先度**: 最優先

### 3. DOM-based XSS

- **概要**: クライアント側のJavaScriptがURLフラグメント等を安全でない方法でDOMに挿入
- **攻撃例**: `http://localhost:5173/page#<img src=x onerror=alert(1)>` — `innerHTML` で反映
- **技術スタック**: React (dangerouslySetInnerHTML)
- **難易度**: ★★☆

## 参考資料

- [OWASP - XSS](https://owasp.org/www-community/attacks/xss/)
