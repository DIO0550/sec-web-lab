# 不要なヘッダー露出

## 対象ラボ

### 1. レスポンスヘッダーの過剰な情報公開

- **概要**: X-Powered-By 等でサーバー技術情報が漏洩
- **攻撃例**: レスポンスヘッダーからフレームワーク・バージョンを特定
- **技術スタック**: Hono API
- **難易度**: ★☆☆

## 参考資料

- [OWASP - HTTP Headers](https://owasp.org/www-project-secure-headers/)
