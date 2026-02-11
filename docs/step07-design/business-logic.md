# ビジネスロジックの欠陥

## 対象ラボ

### 1. アプリケーション固有のロジック不備

- **概要**: アプリケーション固有のロジックに欠陥があり、意図しない操作が可能
- **攻撃例**: 商品の価格を負の値にして残高を増やす、数量チェックなしで在庫以上を注文
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★★☆

## 参考資料

- [OWASP - Business Logic Testing](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/10-Business_Logic_Testing/)
