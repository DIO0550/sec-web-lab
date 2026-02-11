# Mass Assignment — パラメータ一括代入

## 対象ラボ

### 1. リクエストパラメータによる権限昇格

- **概要**: APIがリクエストボディの全フィールドをそのままDBに保存し、意図しないフィールドまで変更可能
- **攻撃例**: ユーザー登録APIに `{"username":"hacker","password":"pass","role":"admin"}` を送信
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★★☆

## 実装メモ

- `req.body` をそのまま INSERT (脆弱) → 許可フィールドだけを抽出 (安全)

## 参考資料

- [OWASP - Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)
