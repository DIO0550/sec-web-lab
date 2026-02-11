# CRLFインジェクション (HTTPヘッダーインジェクション)

## 対象ラボ

### 1. HTTPヘッダーへのCRLF注入

- **概要**: ユーザー入力がHTTPレスポンスヘッダーに含まれ、改行コードで追加ヘッダーを注入
- **攻撃例**: `/api/redirect?url=http://example.com%0d%0aSet-Cookie:admin=true`
- **技術スタック**: Hono API
- **難易度**: ★★☆

## 実装メモ

- レスポンスヘッダーにユーザー入力を未検証で設定 (脆弱) → 改行コードを除去 (安全)

## 参考資料

- [OWASP - HTTP Response Splitting](https://owasp.org/www-community/attacks/HTTP_Response_Splitting)
