# JWTの脆弱性

## 対象ラボ

### 1. alg=none 攻撃

- **概要**: JWTヘッダーのアルゴリズムを `none` に変更し、署名検証をバイパス
- **攻撃例**: JWTヘッダーの `alg` を `none` にし、署名部分を空にして送信
- **技術スタック**: Hono API + JWT
- **難易度**: ★★★

### 2. 弱い秘密鍵

- **概要**: 短い / 推測可能な秘密鍵でJWTが署名されており、鍵を特定可能
- **攻撃例**: `secret` `password` 等のよくある鍵でJWTを再署名
- **技術スタック**: Hono API + JWT
- **難易度**: ★★★

## 実装メモ

- jwt.io を使ったペイロード改ざんをガイド
- 弱い検証 (脆弱) → アルゴリズム固定 + 強い鍵 (安全)

## 参考資料

- [OWASP - JWT Attacks](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/10-Testing_JSON_Web_Tokens)
