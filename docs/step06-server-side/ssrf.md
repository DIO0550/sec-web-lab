# SSRF (Server-Side Request Forgery)

## 対象ラボ

### 1. 内部ネットワークへの不正リクエスト

- **概要**: サーバーに内部ネットワークへのリクエストを行わせる
- **攻撃例**: `/api/fetch-url?url=http://localhost:5432` で内部サービスにアクセス
- **技術スタック**: Hono API (URL取得エンドポイント)
- **難易度**: ★★☆

## 参考資料

- [OWASP - SSRF](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery)
