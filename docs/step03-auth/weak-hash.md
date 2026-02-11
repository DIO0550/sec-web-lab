# 弱いハッシュアルゴリズム (MD5 / SHA1)

## 対象ラボ

### 1. レインボーテーブルによるハッシュ逆引き

- **概要**: MD5やSHA1でパスワードをハッシュ → レインボーテーブルで逆引き可能
- **攻撃例**: ハッシュ値を取得し、オンラインのレインボーテーブルで検索
- **技術スタック**: Node.js crypto + PostgreSQL
- **難易度**: ★★☆

## 参考資料

- [OWASP - Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
