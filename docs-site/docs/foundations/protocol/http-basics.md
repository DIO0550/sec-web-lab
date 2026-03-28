---
title: HTTPの基礎
sidebar_position: 1
---

# HTTPの基礎

> Webセキュリティを学ぶ上で最も基本となる、HTTPプロトコルの構造を解説します。ハンズオンラボに取り組む前に、ここで紹介する概念を理解しておくと、攻撃手法や防御策の「なぜ」が見えてきます。

---

## HTTPリクエスト/レスポンスの構造

HTTPはWebブラウザとWebサーバーの間で情報をやり取りするためのプロトコルである。すべてのWebアプリケーションはHTTPの上に構築されており、セキュリティの理解にはHTTPメッセージの構造を知ることが不可欠。

<div class="http-structure">
  <div class="http-message http-message--request">
    <div class="http-message__title">リクエスト (Request)</div>
    <div class="http-message__line http-message__line--start">GET /api/users?id=42 HTTP/1.1</div>
    <div class="http-message__line http-message__line--header">Host: example.com</div>
    <div class="http-message__line http-message__line--header">Cookie: session_id=abc123</div>
    <div class="http-message__line http-message__line--header">Accept: application/json</div>
  </div>
  <div class="http-message http-message--response">
    <div class="http-message__title">レスポンス (Response)</div>
    <div class="http-message__line http-message__line--start">HTTP/1.1 200 OK</div>
    <div class="http-message__line http-message__line--header">Content-Type: application/json</div>
    <div class="http-message__line http-message__line--header">Set-Cookie: session_id=abc123</div>
    <div class="http-message__line http-message__line--body">{"id": 42, "name": "Alice"}</div>
  </div>
</div>

### リクエストの構造

HTTPリクエストは**リクエストライン**、**ヘッダ**、**空行**、**ボディ**の4つの部分で構成される。

```
GET /api/users?id=42 HTTP/1.1        ← リクエストライン（メソッド、パス、バージョン）
Host: example.com                     ← ヘッダ（1行目）
User-Agent: Mozilla/5.0               ← ヘッダ（2行目）
Accept: application/json              ← ヘッダ（3行目）
Cookie: session_id=abc123             ← ヘッダ（4行目）
                                      ← 空行（ヘッダとボディの区切り）
```

POSTリクエストの場合、ボディにデータが含まれる:

```
POST /api/login HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 49

{"username": "alice", "password": "secret123"}
```

curlコマンドで実際のリクエストを確認してみよう:

```bash
# -v オプションで送受信の詳細を表示
curl -v http://localhost:3000/api/users?id=42

# POSTリクエストの送信
curl -v -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secret123"}'
```

### レスポンスの構造

HTTPレスポンスは**ステータスライン**、**ヘッダ**、**空行**、**ボディ**で構成される。

```
HTTP/1.1 200 OK                       ← ステータスライン（バージョン、ステータスコード、理由フレーズ）
Content-Type: application/json         ← ヘッダ
Set-Cookie: session_id=abc123; Path=/  ← ヘッダ
X-Powered-By: Hono                    ← ヘッダ（技術情報の漏洩例）
                                       ← 空行
{"id": 42, "name": "Alice"}           ← ボディ
```

ヘッダはブラウザの DevTools（Networkタブ）や `curl -I`（ヘッダのみ取得）で誰でも確認できる。**レスポンスヘッダに含まれる情報はすべて公開情報**であることを意識しておくこと。

---

## 主要なHTTPメソッド

### メソッドの一覧

| メソッド | 用途 | ボディ | 冪等性 |
|----------|------|--------|--------|
| **GET** | リソースの取得 | なし | あり |
| **POST** | リソースの作成・データの送信 | あり | なし |
| **PUT** | リソースの更新（全体置換） | あり | あり |
| **DELETE** | リソースの削除 | なし（通常） | あり |
| **PATCH** | リソースの部分更新 | あり | なし |
| **HEAD** | ヘッダのみ取得（GETのボディなし版） | なし | あり |
| **OPTIONS** | 対応メソッドの問い合わせ（CORS プリフライト） | なし | あり |

**冪等性（idempotency）**: 同じリクエストを何度送っても結果が変わらない性質。GETは何回呼んでも同じデータを返すが、POSTは呼ぶたびに新しいリソースが作成される可能性がある。

### GETとPOSTの使い分け

GETとPOSTの使い分けはセキュリティに直結する重要なポイントである。

| 観点 | GET | POST |
|------|-----|------|
| パラメータの場所 | URLのクエリ文字列 (`?key=value`) | リクエストボディ |
| ブラウザ履歴 | URLに残る | 残らない |
| ブックマーク | 可能（パラメータ含む） | 不可 |
| Refererヘッダ | パラメータがURLに含まれるため漏洩する | ボディは漏洩しない |
| サーバーログ | URLが記録されパラメータも残る | ボディは通常記録されない |
| キャッシュ | キャッシュされる可能性がある | 通常キャッシュされない |
| データ長の制限 | URLの長さに制限あり（実質2,000〜8,000文字程度） | 制限は緩い |

**セキュリティ上の原則**: 秘密情報（パスワード、トークン等）はGETのクエリ文字列に含めてはいけない。URLはブラウザ履歴、サーバーログ、Refererヘッダなど多くの場所に残るため、情報漏洩のリスクが高い。

```bash
# 悪い例: パスワードがURLに含まれ、ログやRefererで漏洩する
curl "http://localhost:3000/api/login?username=alice&password=secret123"

# 良い例: パスワードはボディに含まれ、URLには現れない
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secret123"}'
```

また、**副作用のある操作（データの作成・更新・削除）にはGETを使ってはいけない**。GETリクエストはブラウザがプリフェッチやキャッシュのために自動的に送信することがあり、意図しない操作が実行されてしまう危険がある。imgタグやlinkタグによる自動取得でもGETリクエストは送信される。

---

## ステータスコード

HTTPステータスコードは3桁の数値で、リクエストの処理結果を示す。セキュリティの観点では、ステータスコードの使い方自体が情報漏洩につながることがある。

### 代表的なステータスコード

| コード | 意味 | セキュリティ上の注意 |
|--------|------|----------------------|
| **200 OK** | 正常に処理された | - |
| **201 Created** | リソースが作成された | - |
| **301 Moved Permanently** | 恒久的リダイレクト | オープンリダイレクトに悪用される可能性 |
| **302 Found** | 一時的リダイレクト | 同上 |
| **304 Not Modified** | キャッシュが有効 | - |
| **400 Bad Request** | リクエストが不正 | エラーメッセージに内部情報を含めないこと |
| **401 Unauthorized** | 認証が必要 | 認証の有無を示してしまう |
| **403 Forbidden** | アクセス権がない | リソースの存在を示してしまう場合がある |
| **404 Not Found** | リソースが見つからない | - |
| **405 Method Not Allowed** | メソッドが許可されていない | 対応メソッドの情報が漏洩 |
| **500 Internal Server Error** | サーバー内部エラー | スタックトレースを返さないこと |

### セキュリティ上の注意: ステータスコードによる情報漏洩

ログイン機能で、存在しないユーザー名に `404` を、パスワード間違いに `401` を返すと、攻撃者はステータスコードの違いからユーザー名の存在を確認できてしまう（ユーザー列挙攻撃）。

```
# 攻撃者がユーザー名の存在を確認する
POST /api/login  {"username": "alice", "password": "wrong"}  → 401 (aliceは存在する)
POST /api/login  {"username": "bob", "password": "wrong"}    → 404 (bobは存在しない)
```

安全な実装では、どちらの場合も同じステータスコード・同じエラーメッセージを返すべきである。

---

## 関連ラボ

以下のラボで、本ドキュメントの知識を実際に試すことができる:

### Step 01: 偵察

| ラボ | 関連する知識 |
|------|--------------|
| [HTTPレスポンスヘッダーからの情報漏洩](../../step01-recon/header-leakage) | HTTPレスポンスヘッダの構造、公開性 |
| [不要なヘッダー露出](../../step01-recon/header-exposure) | セキュリティヘッダの役割 |
| [エラーメッセージからの情報漏洩](../../step01-recon/error-message-leakage) | ステータスコードとエラーメッセージの扱い |

---

## 参考資料

- [MDN - HTTP の概要](https://developer.mozilla.org/ja/docs/Web/HTTP/Overview)
- [RFC 7231 - Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content](https://datatracker.ietf.org/doc/html/rfc7231)
