# オープンリダイレクト

## 対象ラボ

### 1. URL パラメータによるオープンリダイレクト

- **概要**: リダイレクト先URLを外部から指定可能で、フィッシングサイトに誘導される
- **攻撃例**: `/api/redirect?url=https://evil.example.com`
- **技術スタック**: Hono API
- **難易度**: ★☆☆

## 実装メモ

- ホワイトリスト検証なし (脆弱) → 許可ドメインリストで検証 (安全) の比較

## 参考資料

- [OWASP - Open Redirect](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/04-Testing_for_Client-side_URL_Redirect)
