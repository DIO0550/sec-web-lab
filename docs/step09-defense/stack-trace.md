# スタックトレース漏洩

## 対象ラボ

### 1. エラー時のスタックトレース公開

- **概要**: エラー発生時にスタックトレースがそのままクライアントに返される
- **攻撃例**: 不正な入力を送信し、レスポンスからファイルパス・ライブラリバージョン等を取得
- **技術スタック**: Hono API + Node.js
- **難易度**: ★☆☆

## 参考資料

- [OWASP - Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
