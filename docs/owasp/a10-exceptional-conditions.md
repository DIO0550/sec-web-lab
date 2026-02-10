# A10: Mishandling of Exceptional Conditions — 例外処理の不備

## 対象ラボ

### 1. スタックトレース漏洩

- **概要**: エラー発生時にスタックトレースがそのままクライアントに返される
- **攻撃例**: 不正な入力を送信し、レスポンスからファイルパス・ライブラリバージョン等を取得
- **技術スタック**: Hono API + Node.js
- **難易度**: ★☆☆

### 2. Fail-Open (エラー時にアクセス許可)

- **概要**: 認証・認可の例外発生時に、デフォルトでアクセスを許可してしまう
- **攻撃例**: 認証サーバーに接続できない場合にログインをスキップ
- **技術スタック**: Hono API ミドルウェア
- **難易度**: ★★☆

## 参考資料

- [OWASP - Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
