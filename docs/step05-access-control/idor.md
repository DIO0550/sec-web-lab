# IDOR (Insecure Direct Object Reference)

## 対象ラボ

### 1. 他ユーザーデータへの不正参照

- **概要**: ユーザーIDやリソースIDを直接操作して、他ユーザーのデータを参照・変更する
- **攻撃例**: `/api/users/1/profile` → `/api/users/2/profile` にIDを書き換えるだけでアクセス可能
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★☆☆

## 参考資料

- [OWASP - IDOR](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References)
