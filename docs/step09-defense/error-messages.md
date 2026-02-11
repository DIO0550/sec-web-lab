# 詳細エラーメッセージ露出

## 対象ラボ

### 1. デバッグ情報の漏洩

- **概要**: スタックトレースやDB構造がエラーレスポンスに含まれる
- **攻撃例**: 不正なリクエストを送り、レスポンスからテーブル名やカラム名を取得
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★☆☆

## 参考資料

- [OWASP - Improper Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
