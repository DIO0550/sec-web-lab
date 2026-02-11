# ログインジェクション

## 対象ラボ

### 1. ログエントリの改ざん

- **概要**: ユーザー入力がサニタイズされずにログに書き込まれ、ログを改ざん可能
- **攻撃例**: ユーザー名に改行コードを含めて偽のログエントリを挿入
- **技術スタック**: Hono API + console.log / ファイルログ
- **難易度**: ★★☆

## 参考資料

- [OWASP - Log Injection](https://owasp.org/www-community/attacks/Log_Injection)
