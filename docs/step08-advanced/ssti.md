# SSTI (Server-Side Template Injection) — サーバーサイドテンプレートインジェクション

## 対象ラボ

### 1. テンプレートエンジンを悪用したコード実行

- **概要**: ユーザー入力がテンプレートエンジンに渡され、サーバーサイドでコードが実行される
- **攻撃例**: 名前入力に `{{7*7}}` を入力 → レスポンスに `49` が表示される
- **技術スタック**: Hono API + テンプレートエンジン (eta / ejs 等)
- **難易度**: ★★★

## 実装メモ

- 簡易テンプレートエンジンを導入して再現
- ユーザー入力をテンプレート文字列に結合 (脆弱) → 変数としてのみ渡す (安全)

## 参考資料

- [OWASP - SSTI](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Server-side_Template_Injection)
