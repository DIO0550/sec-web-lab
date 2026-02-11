# CORS設定ミス

## 対象ラボ

### 1. 任意のオリジンからのAPI呼び出し

- **概要**: Access-Control-Allow-Origin の設定不備で任意のオリジンからAPI呼び出し可能
- **攻撃例**: 悪意あるサイトからfetchでAPIを叩いてデータを窃取
- **技術スタック**: Hono CORS ミドルウェア
- **難易度**: ★★☆

## 参考資料

- [OWASP - CORS Misconfiguration](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/07-Testing_Cross_Origin_Resource_Sharing)
