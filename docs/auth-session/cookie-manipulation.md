# Cookie操作 (Secure / HttpOnly / SameSite 未設定)

## 対象ラボ

### 1. Cookie属性の不備

- **概要**: セキュリティ関連のCookie属性が設定されておらず、各種攻撃に脆弱
- **攻撃例**:
  - `HttpOnly` なし → JavaScriptから `document.cookie` でアクセス可能
  - `Secure` なし → HTTP通信でCookieが平文で送信される
  - `SameSite` なし → CSRF攻撃でCookieが自動送信される
- **技術スタック**: Hono API + Cookie
- **難易度**: ★☆☆

## 実装メモ

- DevToolsのApplication > Cookiesタブで属性を確認
- 属性なし (脆弱) → 全属性付き (安全) の比較

## 参考資料

- [OWASP - Cookie Security](https://owasp.org/www-community/controls/SecureCookieAttribute)
