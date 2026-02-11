# セッション固定攻撃 (Session Fixation)

## 対象ラボ

### 1. 事前指定したセッションIDでのログイン

- **概要**: 攻撃者が指定したセッションIDでログインが成立してしまう
- **攻撃例**: 事前に発行したセッションIDをURLパラメータ経由で被害者に踏ませる
- **技術スタック**: Hono API + Cookieベースセッション
- **難易度**: ★★☆

## 参考資料

- [OWASP - Session Fixation](https://owasp.org/www-community/attacks/Session_fixation)
