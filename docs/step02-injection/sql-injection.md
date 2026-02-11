# SQLインジェクション

## 対象ラボ

### 1. SQLインジェクションによる認証バイパス・データ抽出

- **概要**: ユーザー入力がSQL文にそのまま結合され、任意のSQLを実行可能
- **攻撃例**: ログインフォームに `' OR 1=1 --` を入力して認証バイパス
- **攻撃例2**: `' UNION SELECT username, password FROM users --` でデータ抽出
- **技術スタック**: Hono API + PostgreSQL (pg ドライバ)
- **難易度**: ★☆☆
- **優先度**: 最優先 (最も代表的な脆弱性)

## 参考資料

- [OWASP - SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
