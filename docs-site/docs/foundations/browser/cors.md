---
title: CORSの仕組み
sidebar_position: 2
---

# CORSの仕組み

> 同一オリジンポリシー（SOP）を制御された方法で緩和する「CORS（Cross-Origin Resource Sharing）」の仕組みを解説します。現代のWebアプリケーション開発では、CORSの正しい理解が不可欠です。

---

## なぜCORSが必要か

同一オリジンポリシーは安全性を提供するが、**正当なクロスオリジン通信まで制限してしまう**。

現代のWebアプリケーションでは、フロントエンドとAPIが異なるオリジンにあることが一般的である:

```
フロントエンド: https://app.example.com     (ポート443)
API:          https://api.example.com     (ポート443、異なるホスト)

ローカル開発:
フロントエンド: http://localhost:5173       (Vite)
API:          http://localhost:3000       (Hono、異なるポート)
```

SOPのままでは、フロントエンドからAPIへの `fetch` リクエストのレスポンスが読めない。CORSは、サーバーが<strong>「このオリジンからのアクセスは許可する」</strong>と明示的に宣言することで、SOPを安全に緩和する仕組みである。

---

## Access-Control-Allow-Origin ヘッダ

CORSの最も基本的なヘッダ。サーバーがレスポンスに含めることで、どのオリジンからのアクセスを許可するかを宣言する。

```
# サーバーのレスポンス
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Content-Type: application/json

{"data": "secret"}
```

ブラウザの動作:

1. `https://app.example.com` のスクリプトが `https://api.example.com` にリクエストを送信
2. サーバーがレスポンスに `Access-Control-Allow-Origin: https://app.example.com` を含めて返す
3. ブラウザが「リクエスト元のオリジン」と「Access-Control-Allow-Origin の値」を比較する
4. 一致すれば、JavaScriptにレスポンスを渡す。不一致ならブロックする

```javascript
// https://app.example.com のスクリプト
const response = await fetch('https://api.example.com/data');
// サーバーが Access-Control-Allow-Origin: https://app.example.com を返せば成功
const data = await response.json();
```

### ワイルドカード（*）の使用

```
Access-Control-Allow-Origin: *
```

すべてのオリジンからのアクセスを許可する。公開API（天気情報、為替レートなど）では有効だが、**認証情報を含むリクエストでは使用できない**（後述）。

---

## 単純リクエスト（Simple Request）の条件

以下のすべての条件を満たすリクエストは「単純リクエスト」として扱われ、**プリフライトリクエストなしで**直接送信される。

| 条件 | 許可される値 |
|------|-------------|
| メソッド | GET, HEAD, POST のいずれか |
| ヘッダ | Accept, Accept-Language, Content-Language, Content-Type のみ |
| Content-Type | `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain` のいずれか |

```
# 単純リクエストの例（プリフライトなし）
POST /api/data HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Content-Type: application/x-www-form-urlencoded

key=value
```

```
# 単純リクエストではない例（プリフライトが発生する）
POST /api/data HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Content-Type: application/json          ← JSONは単純リクエストの条件外
X-Custom-Header: value                  ← カスタムヘッダは条件外

{"key": "value"}
```

**セキュリティ上の意味**: 単純リクエストの条件は、HTMLフォームで送信可能なリクエストと一致するように設計されている。フォーム送信はSOP導入以前から可能だったため、後方互換性のためにプリフライトなしで送信される。つまり、**単純リクエストに該当するPOSTリクエストは、CORSの有無に関係なくサーバーに到達する**。これはCSRF攻撃に直結する。

---

## プリフライトリクエスト（OPTIONS）の詳細

単純リクエストの条件を満たさないリクエストを送信する前に、ブラウザは自動的に**プリフライトリクエスト**を送信する。これは `OPTIONS` メソッドを使った「事前確認」である。

```
# ステップ1: ブラウザが自動的にプリフライトリクエストを送信
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, X-Custom-Header

# ステップ2: サーバーがプリフライトに応答
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, X-Custom-Header
Access-Control-Max-Age: 86400

# ステップ3: プリフライトが許可されたので、実際のリクエストを送信
POST /api/data HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Content-Type: application/json
X-Custom-Header: value

{"key": "value"}

# ステップ4: サーバーが実際のレスポンスを返す
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Content-Type: application/json

{"result": "success"}
```

プリフライトレスポンスの各ヘッダの意味:

| ヘッダ | 説明 |
|--------|------|
| `Access-Control-Allow-Origin` | 許可するオリジン |
| `Access-Control-Allow-Methods` | 許可するHTTPメソッド |
| `Access-Control-Allow-Headers` | 許可するリクエストヘッダ |
| `Access-Control-Max-Age` | プリフライト結果のキャッシュ時間（秒） |

curlでプリフライトリクエストをシミュレートする:

```bash
# プリフライトリクエストの手動送信
curl -v -X OPTIONS http://localhost:3000/api/data \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

---

## 認証付きクロスオリジンリクエスト（credentials: 'include'）

デフォルトでは、クロスオリジンの `fetch` リクエストにCookieは含まれない。Cookieを送信するには、クライアント側で `credentials: 'include'` を指定し、サーバー側でも明示的に許可する必要がある。

```javascript
// クライアント側: credentials: 'include' でCookieを送信
const response = await fetch('https://api.example.com/profile', {
  credentials: 'include'  // クロスオリジンリクエストにCookieを含める
});
```

```
# サーバー側のレスポンスに必要なヘッダ
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Content-Type: application/json
```

### Access-Control-Allow-Credentials と Access-Control-Allow-Origin: * の関係

**重要な制約**: `Access-Control-Allow-Credentials: true` を返す場合、`Access-Control-Allow-Origin` に `*`（ワイルドカード）を使用することはできない。

```
# ⚠️ 無効な組み合わせ — ブラウザがブロックする
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

この制約がないと、**任意のオリジンから認証付きリクエストが可能**になり、攻撃者のサイトから被害者のCookieを使ってAPIを呼び出し、レスポンス（個人情報等）を窃取できてしまう。

```
# ✅ 正しい設定: 具体的なオリジンを指定
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

この制約を回避しようとして、リクエストの `Origin` ヘッダの値をそのまま `Access-Control-Allow-Origin` にエコーバックするパターンは**重大な脆弱性**（CORS misconfiguration）となる:

```typescript
// ⚠️ 危険: リクエストのOriginをそのまま反映
app.use('*', async (c, next) => {
  await next();
  const origin = c.req.header('Origin');
  c.res.headers.set('Access-Control-Allow-Origin', origin ?? '*');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  // → 攻撃者のオリジン https://evil.com からも認証付きアクセスが可能になる
});
```

```typescript
// ✅ 安全: 許可リストでオリジンを検証
const ALLOWED_ORIGINS = ['https://app.example.com', 'http://localhost:5173'];

app.use('*', async (c, next) => {
  await next();
  const origin = c.req.header('Origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
    c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  }
});
```

---

## CORSプリフライトのシーケンス図

```
ブラウザ (https://app.example.com)              サーバー (https://api.example.com)
    |                                                |
    |  [非単純リクエストを検出]                         |
    |                                                |
    |  OPTIONS /api/data                             |
    |  Origin: https://app.example.com               |
    |  Access-Control-Request-Method: POST           |
    |  Access-Control-Request-Headers: Content-Type   |
    |───────────────────────────────────────────────→|
    |                                                | [オリジンを検証]
    |  204 No Content                                |
    |  Access-Control-Allow-Origin: https://app...   |
    |  Access-Control-Allow-Methods: POST            |
    |  Access-Control-Allow-Headers: Content-Type    |
    |  Access-Control-Max-Age: 86400                 |
    |←───────────────────────────────────────────────|
    |                                                |
    |  [プリフライトOK → 実リクエスト送信]               |
    |                                                |
    |  POST /api/data                                |
    |  Origin: https://app.example.com               |
    |  Content-Type: application/json                |
    |  {"key": "value"}                              |
    |───────────────────────────────────────────────→|
    |                                                |
    |  200 OK                                        |
    |  Access-Control-Allow-Origin: https://app...   |
    |  {"result": "success"}                         |
    |←───────────────────────────────────────────────|
```

---

## 開発環境での実践

sec-web-labの開発環境では、フロントエンド（`http://localhost:5173`）とバックエンド（`http://localhost:3000`）が異なるポートで動作するため、クロスオリジン通信になる。

```
フロントエンド: http://localhost:5173  (Vite + React)
バックエンド:   http://localhost:3000  (Hono)

→ ポートが異なるため別オリジン
→ フロントエンドからバックエンドへのfetchにはCORS設定が必要
```

開発環境ではViteのプロキシ設定やHono側のCORSミドルウェアで対応するが、この仕組みを理解していないと「なぜ開発中にCORSエラーが出るのか」「なぜ本番環境では出ないのか」が分からなくなる。

---

## 関連ラボ

以下のラボで、本ドキュメントの知識を実際に試すことができる:

### CORS設定の問題

| ラボ | 関連する知識 |
|------|--------------|
| [CORS Misconfiguration](../../step06-server-side/cors-misconfiguration.mdx) | CORSの誤設定（Originエコーバック等）によるデータ窃取。Access-Control-Allow-Origin と Access-Control-Allow-Credentials の危険な組み合わせを体験する |

---

## 参考資料

- [MDN - CORS (Cross-Origin Resource Sharing)](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [OWASP - CORS Misconfiguration](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/07-Testing_Cross_Origin_Resource_Sharing)
- [Fetch Standard - CORS Protocol](https://fetch.spec.whatwg.org/#http-cors-protocol)
