# 推測可能なパスワードリセット

## 対象ラボ

### 1. 連番トークンによるリセット

- **概要**: パスワードリセットトークンが連番や短い数値で推測可能
- **攻撃例**: `/api/reset?token=0001` → `0002` → `0003` と総当たり
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★★☆

## 参考資料

- [OWASP - Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
