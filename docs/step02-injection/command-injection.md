# OSコマンドインジェクション

## 対象ラボ

### 1. シェルコマンドの注入

- **概要**: ユーザー入力がシェルコマンドに渡され、任意のOSコマンドを実行可能
- **攻撃例**: pingツールに `127.0.0.1; cat /etc/passwd` を入力
- **技術スタック**: Hono API + Node.js child_process
- **難易度**: ★★☆

## 参考資料

- [OWASP - OS Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
