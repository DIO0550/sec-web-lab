# A09: Security Logging & Alerting Failures — セキュリティログの不備

## 対象ラボ

### 1. ログなし / 不十分なログ

- **概要**: ログイン失敗・権限エラー等のセキュリティイベントが記録されない
- **攻撃例**: ブルートフォース攻撃を実行しても、サーバーログに痕跡が残らない
- **技術スタック**: Hono API
- **難易度**: ★☆☆

### 2. ログインジェクション

- **概要**: ユーザー入力がサニタイズされずにログに書き込まれ、ログを改ざん可能
- **攻撃例**: ユーザー名に改行コードを含めて偽のログエントリを挿入
- **技術スタック**: Hono API + console.log / ファイルログ
- **難易度**: ★★☆

## 参考資料

- [OWASP Top 10 - A09:2021 Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)
