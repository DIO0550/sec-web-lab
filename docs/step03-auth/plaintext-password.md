# 平文パスワード保存

## 対象ラボ

### 1. ハッシュ化されていないパスワード

- **概要**: パスワードをハッシュ化せず平文でDBに保存
- **攻撃例**: SQLインジェクション等でDB内容を取得 → パスワードがそのまま読める
- **技術スタック**: PostgreSQL (usersテーブル)
- **難易度**: ★☆☆

## 参考資料

- [OWASP - Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
