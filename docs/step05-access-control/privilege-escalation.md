# 権限昇格 (Privilege Escalation)

## 対象ラボ

### 1. 一般ユーザーから管理者操作を実行

- **概要**: 一般ユーザーが管理者限定の操作を実行する
- **攻撃例**: 管理者APIに直接リクエストを送る、ロールをリクエストパラメータで指定する
- **技術スタック**: Hono API + セッション管理
- **難易度**: ★★☆

## 参考資料

- [OWASP - Privilege Escalation](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/03-Testing_for_Privilege_Escalation)
