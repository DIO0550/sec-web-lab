# A07: Identification & Authentication Failures — 認証の不備

## 対象ラボ

### 1. ブルートフォース攻撃

- **概要**: ログイン試行にアカウントロック・遅延がなく、総当たりが可能
- **攻撃例**: curlやスクリプトでパスワード辞書を順に試行
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★☆☆

### 2. セッション固定攻撃 (Session Fixation)

- **概要**: 攻撃者が指定したセッションIDでログインが成立してしまう
- **攻撃例**: 事前に発行したセッションIDをURLパラメータ経由で被害者に踏ませる
- **技術スタック**: Hono API + Cookieベースセッション
- **難易度**: ★★☆

### 3. 弱いパスワードポリシー

- **概要**: `123456` や `password` 等の脆弱なパスワードが登録可能
- **攻撃例**: 弱いパスワードで登録 → ブルートフォースで即突破
- **技術スタック**: Hono API (バリデーション)
- **難易度**: ★☆☆

### 4. JWT改ざん

- **概要**: JWTの署名アルゴリズムを `none` に変更、または弱い秘密鍵を使用
- **攻撃例**: JWTのペイロードを書き換えてroleをadminに変更
- **技術スタック**: Hono API + JWT ライブラリ
- **難易度**: ★★★

## 参考資料

- [OWASP Top 10 - A07:2021 Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
