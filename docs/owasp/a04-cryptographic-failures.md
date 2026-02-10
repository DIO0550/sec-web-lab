# A04: Cryptographic Failures — 暗号化の不備

## 対象ラボ

### 1. 平文パスワード保存

- **概要**: パスワードをハッシュ化せず平文でDBに保存
- **攻撃例**: SQLインジェクション等でDB内容を取得 → パスワードがそのまま読める
- **技術スタック**: PostgreSQL (usersテーブル)
- **難易度**: ★☆☆

### 2. 弱いハッシュアルゴリズム (MD5 / SHA1)

- **概要**: MD5やSHA1でパスワードをハッシュ → レインボーテーブルで逆引き可能
- **攻撃例**: ハッシュ値を取得し、オンラインのレインボーテーブルで検索
- **技術スタック**: Node.js crypto + PostgreSQL
- **難易度**: ★★☆

### 3. HTTPでの機密データ送信

- **概要**: ログインフォームがHTTPで送信され、パスワードが平文で流れる
- **攻撃例**: ブラウザのDevTools Network タブで通信を確認
- **技術スタック**: React フォーム + Hono API
- **難易度**: ★☆☆ (概念の確認)

## 参考資料

- [OWASP Top 10 - A02:2021 Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
