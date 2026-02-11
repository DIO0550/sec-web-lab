# HTTPレスポンスヘッダーからの情報漏洩

## 対象ラボ

### 1. サーバー技術情報の露出

- **概要**: `X-Powered-By`, `Server` 等のヘッダーからフレームワーク・バージョンが判明
- **攻撃例**: `curl -I http://localhost:3000` でヘッダーを確認
- **技術スタック**: Hono API
- **難易度**: ★☆☆

## 実装メモ

- ヘッダー露出あり (脆弱) → 不要ヘッダー除去 (安全) の比較
- DevTools の Network タブでも確認可能

## 参考資料

- [OWASP - HTTP Headers](https://owasp.org/www-project-secure-headers/)
