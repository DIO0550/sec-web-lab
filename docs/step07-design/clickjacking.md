# クリックジャッキング

## 対象ラボ

### 1. iframe によるクリックジャッキング

- **概要**: 透明なiframeで対象サイトを重ね、ユーザーに意図しないクリックをさせる
- **攻撃例**: 「当選おめでとう」ボタンの裏に「アカウント削除」ボタンを配置
- **技術スタック**: HTML + CSS (iframe) + Hono API
- **難易度**: ★☆☆

## 実装メモ

- X-Frame-Options / CSP frame-ancestors なし (脆弱) → ヘッダー付与 (安全) の比較
- 攻撃者用のHTMLページを用意

## 参考資料

- [OWASP - Clickjacking](https://owasp.org/www-community/attacks/Clickjacking)
