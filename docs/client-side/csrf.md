# CSRF (Cross-Site Request Forgery) — クロスサイトリクエストフォージェリ

## 対象ラボ

### 1. CSRF によるパスワード変更

- **概要**: 被害者がログイン中に、攻撃者のページを開くとパスワードが変更される
- **攻撃例**: 攻撃者サイトに `<form action="http://localhost:3000/api/change-password" method="POST">` を設置
- **技術スタック**: Hono API + React (攻撃者ページも用意)
- **難易度**: ★★☆

## 実装メモ

- 攻撃者用の別HTMLページ (`frontend/public/attacker/` 等) を用意して、CSRF攻撃を再現する
- CSRFトークンなし (脆弱) → CSRFトークンあり (安全) の比較

## 参考資料

- [OWASP - CSRF](https://owasp.org/www-community/attacks/csrf)
