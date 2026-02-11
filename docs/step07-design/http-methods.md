# 不要なHTTPメソッド許可

## 対象ラボ

### 1. 制限のないHTTPメソッド

- **概要**: PUT / DELETE / TRACE 等を制限なく受け付ける
- **攻撃例**: `curl -X DELETE /api/users/1` で意図しないリソース削除
- **技術スタック**: Hono API
- **難易度**: ★☆☆

## 参考資料

- [OWASP - Test HTTP Methods](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/06-Test_HTTP_Methods)
