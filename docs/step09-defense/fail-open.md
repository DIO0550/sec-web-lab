# Fail-Open (エラー時にアクセス許可)

## 対象ラボ

### 1. 例外発生時のセキュリティバイパス

- **概要**: 認証・認可の例外発生時に、デフォルトでアクセスを許可してしまう
- **攻撃例**: 認証サーバーに接続できない場合にログインをスキップ
- **技術スタック**: Hono API ミドルウェア
- **難易度**: ★★☆

## 参考資料

- [OWASP - Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
