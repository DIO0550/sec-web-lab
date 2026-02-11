# 安全でないデシリアライゼーション

## 対象ラボ

### 1. シリアライズデータを悪用したコード実行

- **概要**: ユーザーからのシリアライズされたデータをそのまま復元し、任意のコードが実行される
- **攻撃例**: JSON内に悪意ある関数呼び出しを仕込む、`eval()` で処理されるデータを送信
- **技術スタック**: Hono API + Node.js
- **難易度**: ★★★

## 参考資料

- [OWASP - Deserialization](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/16-Testing_for_HTTP_Incoming_Requests)
