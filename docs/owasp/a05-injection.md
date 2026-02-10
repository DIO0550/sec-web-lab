# A05: Injection — インジェクション

## 対象ラボ

### 1. SQLインジェクション

- **概要**: ユーザー入力がSQL文にそのまま結合され、任意のSQLを実行可能
- **攻撃例**: ログインフォームに `' OR 1=1 --` を入力して認証バイパス
- **攻撃例2**: `' UNION SELECT username, password FROM users --` でデータ抽出
- **技術スタック**: Hono API + PostgreSQL (pg ドライバ)
- **難易度**: ★☆☆
- **優先度**: 最優先 (最も代表的な脆弱性)

### 2. OSコマンドインジェクション

- **概要**: ユーザー入力がシェルコマンドに渡され、任意のOSコマンドを実行可能
- **攻撃例**: pingツールに `127.0.0.1; cat /etc/passwd` を入力
- **技術スタック**: Hono API + Node.js child_process
- **難易度**: ★★☆

## ローカル再現が困難なもの (除外)

- **NoSQLインジェクション**: MongoDB が必要
- **LDAPインジェクション**: LDAPサーバーが必要

## 参考資料

- [OWASP Top 10 - A03:2021 Injection](https://owasp.org/Top10/A03_2021-Injection/)
