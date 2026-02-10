# A01: Broken Access Control — アクセス制御の不備

## 対象ラボ

### 1. IDOR (Insecure Direct Object Reference)

- **概要**: ユーザーIDやリソースIDを直接操作して、他ユーザーのデータを参照・変更する
- **攻撃例**: `/api/users/1/profile` → `/api/users/2/profile` にIDを書き換えるだけでアクセス可能
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★☆☆

### 2. パストラバーサル

- **概要**: `../` を使ってサーバー上の意図しないファイルを読み取る
- **攻撃例**: `/api/files?name=../../../etc/passwd`
- **技術スタック**: Hono API (ファイル配信エンドポイント)
- **難易度**: ★☆☆

### 3. 権限昇格 (Privilege Escalation)

- **概要**: 一般ユーザーが管理者限定の操作を実行する
- **攻撃例**: 管理者APIに直接リクエストを送る、ロールをリクエストパラメータで指定する
- **技術スタック**: Hono API + セッション管理
- **難易度**: ★★☆

### 4. CORS設定ミス

- **概要**: Access-Control-Allow-Origin の設定不備で任意のオリジンからAPI呼び出し可能
- **攻撃例**: 悪意あるサイトからfetchでAPIを叩いてデータを窃取
- **技術スタック**: Hono CORS ミドルウェア
- **難易度**: ★★☆

### 5. SSRF (Server-Side Request Forgery)

- **概要**: サーバーに内部ネットワークへのリクエストを行わせる
- **攻撃例**: `/api/fetch-url?url=http://localhost:5432` で内部サービスにアクセス
- **技術スタック**: Hono API (URL取得エンドポイント)
- **難易度**: ★★☆

## 参考資料

- [OWASP Top 10 - A01:2021](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
