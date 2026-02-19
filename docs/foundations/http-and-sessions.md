# HTTPの仕組みとセッション管理

> Webセキュリティを学ぶ上で最も基本となる、HTTPプロトコルの構造とセッション管理の仕組みを解説します。ハンズオンラボに取り組む前に、ここで紹介する概念を理解しておくと、攻撃手法や防御策の「なぜ」が見えてきます。

---

## HTTPリクエスト/レスポンスの構造

HTTPはWebブラウザとWebサーバーの間で情報をやり取りするためのプロトコルである。すべてのWebアプリケーションはHTTPの上に構築されており、セキュリティの理解にはHTTPメッセージの構造を知ることが不可欠。

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

## パーセントエンコーディング（URLエンコーディング）

URLには使用できる文字に制限がある。日本語や特殊文字をURLに含める場合、**パーセントエンコーディング**でエスケープする必要がある。

### 仕組み

文字をUTF-8のバイト列に変換し、各バイトを `%XX`（XXは16進数）で表現する。

| 文字 | UTF-8バイト列 | パーセントエンコーディング |
|------|---------------|---------------------------|
| スペース | `0x20` | `%20` |
| `<` | `0x3C` | `%3C` |
| `>` | `0x3E` | `%3E` |
| `"` | `0x22` | `%22` |
| `あ` | `0xE3 0x81 0x82` | `%E3%81%82` |

```bash
# curlでURLエンコーディングされたパラメータを送信
curl "http://localhost:3000/api/search?q=%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3"
# → "セキュリティ" で検索

# --data-urlencode を使うとcurlが自動でエンコードする
curl -G http://localhost:3000/api/search --data-urlencode "q=セキュリティ"
```

### セキュリティとの関連

パーセントエンコーディングはセキュリティに深く関わる:

- **XSS対策の迂回**: `<script>` を `%3Cscript%3E` と記述してWAFを回避する試み
- **パストラバーサル**: `../` を `%2E%2E%2F` や二重エンコーディング `%252E%252E%252F` で表現してフィルタを迂回
- **SQLインジェクション**: シングルクォートを `%27` でエンコードしてフィルタをすり抜ける

アプリケーション側では、**デコード後の値**に対してバリデーションやエスケープを行う必要がある。エンコーディング前の段階でチェックすると、エンコードされた攻撃文字列を見逃してしまう。

---

## Refererヘッダとプライバシー

### Refererヘッダの仕組み

ブラウザは、リンクのクリックやリソースの読み込み時に、遷移元のURLを `Referer` ヘッダとして送信する。

```
GET /page2 HTTP/1.1
Host: example.com
Referer: https://example.com/page1?token=secret123
```

### プライバシーとセキュリティの問題

RefererヘッダにはURLのクエリ文字列も含まれるため、URLにセンシティブな情報が含まれている場合、外部サイトに漏洩する。

```
# ユーザーが以下のURLでパスワードリセットページにアクセスしている場合
https://example.com/reset?token=a1b2c3d4e5

# そのページから外部の画像やリンクを読み込むと、Refererにトークンが漏れる
GET /image.png HTTP/1.1
Host: external-tracker.com
Referer: https://example.com/reset?token=a1b2c3d4e5
```

### 対策

```
# Referrer-Policy ヘッダでRefererの送信を制御
Referrer-Policy: no-referrer              # Referer を一切送らない
Referrer-Policy: same-origin              # 同一オリジンにのみ送信
Referrer-Policy: strict-origin            # オリジン部分のみ送信（パスやクエリは除去）
Referrer-Policy: no-referrer-when-downgrade  # HTTPS→HTTPの場合は送らない（デフォルト）
```

**教訓**: URLにセンシティブな情報を含めないこと。パスワードリセットトークン等をURLに含める場合は、Referrer-Policyの設定と、トークンの短寿命化を徹底する。

---

## HTTP認証

### Basic認証

HTTP仕様に含まれる最もシンプルな認証方式。ユーザー名とパスワードをBase64エンコードして `Authorization` ヘッダに含める。

```
# 1. クライアントが保護されたリソースにアクセス
GET /admin HTTP/1.1
Host: example.com

# 2. サーバーが 401 で認証を要求
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Admin Area"

# 3. クライアントが認証情報を送信
GET /admin HTTP/1.1
Host: example.com
Authorization: Basic YWxpY2U6c2VjcmV0MTIz
```

curlでBasic認証を試す:

```bash
# ユーザー名: alice, パスワード: secret123
curl -u alice:secret123 http://localhost:3000/admin

# 上記は以下と同等（Base64エンコード済み）
echo -n "alice:secret123" | base64
# → YWxpY2U6c2VjcmV0MTIz

curl -H "Authorization: Basic YWxpY2U6c2VjcmV0MTIz" http://localhost:3000/admin
```

### Base64は暗号化ではない

**よくある誤解**: Base64でエンコードされているからパスワードは安全だと思う人がいるが、これは完全に間違い。Base64は**エンコーディング方式**であり、**暗号化ではない**。誰でも簡単にデコードできる。

```bash
# Base64のデコードは一瞬でできる
echo "YWxpY2U6c2VjcmV0MTIz" | base64 -d
# → alice:secret123
```

したがって、Basic認証は**必ずHTTPS（TLS）と組み合わせて**使う必要がある。HTTPの平文通信でBasic認証を使うと、ネットワーク上でパスワードが丸見えになる。

### Digest認証

Basic認証のパスワード平文送信の問題を改善するために設計された方式。パスワードそのものではなく、パスワードのハッシュ値をチャレンジ・レスポンス方式で送信する。

```
# 1. サーバーがnonceを含むチャレンジを送信
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Digest realm="Admin", nonce="abc123", qop="auth"

# 2. クライアントがnonceを使ってレスポンスハッシュを計算して送信
GET /admin HTTP/1.1
Authorization: Digest username="alice", realm="Admin",
  nonce="abc123", uri="/admin",
  response="6629fae49393a05397450978507c4ef1",
  qop=auth, nc=00000001, cnonce="xyz789"
```

Digest認証ではパスワードが直接ネットワーク上を流れないが、現在では以下の理由でBasic認証 + HTTPSが推奨されている:

- Digest認証はサーバー側でパスワードの平文（またはMD5ハッシュ）を保持する必要がある
- MD5の脆弱性が発見されている
- HTTPSが普及した現在、TLSによる暗号化でBasic認証の平文問題は解決される

---

## 認証と認可の違い

セキュリティでは**認証（authentication）**と**認可（authorization）**を明確に区別することが重要である。

| 概念 | 英語 | 質問 | 例 |
|------|------|------|-----|
| **認証** | Authentication | 「あなたは誰ですか?」 | ログイン（ID/パスワード）、生体認証、多要素認証 |
| **認可** | Authorization | 「あなたはこの操作をする権限がありますか?」 | 管理者のみがユーザー削除可能、自分のプロフィールのみ編集可能 |

### 処理の順序

認証と認可は必ずこの順序で行われる:

```
1. 認証: ユーザーが自分の身元を証明する
   → セッションIDやトークンが発行される

2. 認可: 認証済みのユーザーがリソースにアクセスできるか判定する
   → 権限チェック（ロールベースアクセス制御等）
```

### セキュリティ上の問題パターン

```typescript
// ⚠️ 認証しているが認可していない例
app.delete('/api/users/:id', async (c) => {
  const sessionId = getCookie(c, 'session_id');
  const currentUser = sessions.get(sessionId);
  if (!currentUser) return c.json({ error: '未認証' }, 401);

  // 認証は通ったが、currentUser が :id のユーザーを削除する「権限」があるかチェックしていない
  // → 一般ユーザーが他人のアカウントを削除できてしまう（IDOR脆弱性）
  const targetId = c.req.param('id');
  await deleteUser(targetId);
  return c.json({ message: '削除しました' });
});
```

```typescript
// ✅ 認証 + 認可の両方を行う例
app.delete('/api/users/:id', async (c) => {
  const sessionId = getCookie(c, 'session_id');
  const currentUser = sessions.get(sessionId);
  if (!currentUser) return c.json({ error: '未認証' }, 401);

  const targetId = c.req.param('id');
  // 認可チェック: 自分自身または管理者のみ削除可能
  if (currentUser.id !== targetId && currentUser.role !== 'admin') {
    return c.json({ error: '権限がありません' }, 403);
  }

  await deleteUser(targetId);
  return c.json({ message: '削除しました' });
});
```

---

## ステートレスなHTTPとセッション管理の必要性

### HTTPはステートレス

HTTPプロトコルは**ステートレス（状態を持たない）**である。各リクエストは完全に独立しており、サーバーは前回のリクエストの情報を保持しない。

```
# 1回目のリクエスト: ログインに成功
POST /api/login → 200 OK (認証成功)

# 2回目のリクエスト: サーバーは1回目のことを覚えていない
GET /api/profile → 401 Unauthorized (誰?)
```

HTTPがステートレスに設計されたのには理由がある:

- サーバーの実装がシンプルになる
- スケーラビリティが高い（どのサーバーでもリクエストを処理できる）
- 障害時の影響が限定的

しかし、Webアプリケーションでは「ログイン状態の維持」「ショッピングカート」「ユーザー設定」など、**状態の管理が不可欠**である。この矛盾を解決するのがセッション管理の仕組みである。

### セッション管理の基本的な流れ

```
1. ユーザーがログインに成功する
2. サーバーが「セッションID」と呼ばれる一意の識別子を生成する
3. サーバーはセッションIDとユーザー情報を紐づけて保存する
4. セッションIDをクライアントに返す（通常はCookieで）
5. 以降のリクエストで、クライアントがセッションIDを送信する
6. サーバーはセッションIDからユーザーを特定し、状態を復元する
```

```
クライアント                              サーバー
    |                                       |
    |  POST /login {user, pass}             |
    |-------------------------------------->|
    |                                       | セッションID生成: "sid_xK9mP2..."
    |                                       | sessions["sid_xK9mP2..."] = {user: "alice"}
    |  Set-Cookie: sid=sid_xK9mP2...        |
    |<--------------------------------------|
    |                                       |
    |  GET /profile                         |
    |  Cookie: sid=sid_xK9mP2...            |
    |-------------------------------------->|
    |                                       | sessions["sid_xK9mP2..."] → {user: "alice"}
    |  200 OK {"name": "Alice"}             |
    |<--------------------------------------|
```

---

## Cookieの仕組み

Cookieは、サーバーがブラウザに保存させる小さなデータである。セッション管理の最も一般的な実装手段として使われる。

### Set-CookieとCookieヘッダ

```
# サーバー → ブラウザ: Cookieを保存するよう指示
HTTP/1.1 200 OK
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Lax

# ブラウザ → サーバー: 保存したCookieを自動送信
GET /api/profile HTTP/1.1
Cookie: session_id=abc123
```

重要なポイント: **ブラウザはCookieを自動的に送信する**。ユーザーがCookieの送信を意識する必要はなく、条件に合致するリクエストにはブラウザが自動的にCookieを付与する。この「自動送信」がCSRF攻撃の根本原因となる。

### Cookieの属性

| 属性 | 説明 | セキュリティへの影響 |
|------|------|----------------------|
| **Domain** | Cookieが送信されるドメインの範囲 | 広すぎると他のサブドメインにもCookieが送信される |
| **Path** | Cookieが送信されるパスの範囲 | セキュリティ境界としては不十分 |
| **Secure** | HTTPS接続時のみ送信 | HTTP通信でのCookie漏洩を防止 |
| **HttpOnly** | JavaScriptからアクセス不可 | XSSによるCookie窃取を防止 |
| **SameSite** | クロスサイトリクエストでの送信制御 | CSRF攻撃の緩和 |
| **Expires / Max-Age** | Cookieの有効期限 | 長すぎるとセッションハイジャックのリスク増大 |

### SameSite属性の詳細

SameSite属性はCSRF対策の重要な仕組みである。

| 値 | 動作 |
|----|------|
| **Strict** | クロスサイトリクエストでは一切Cookieを送信しない。最も安全だが、外部リンクからのアクセスでもCookieが送信されないため、ユーザー体験に影響する |
| **Lax** | GETリクエスト（トップレベルナビゲーション）にのみCookieを送信。POSTではCookieが送信されない。モダンブラウザのデフォルト値 |
| **None** | すべてのクロスサイトリクエストでCookieを送信する。`Secure` 属性が必須 |

```
# 安全なCookie設定の例
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
```

```bash
# curlでCookieを送信する
curl -b "session_id=abc123" http://localhost:3000/api/profile

# Set-Cookieヘッダを確認する
curl -v http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secret123"}' 2>&1 | grep -i set-cookie
```

---

## セッションIDの役割と要件

セッションIDはサーバー側に保存されたセッション情報への「鍵」である。この鍵が推測されたり窃取されたりすると、攻撃者がそのユーザーになりすますことができてしまう（セッションハイジャック）。

### セッションIDに求められる要件

| 要件 | 理由 |
|------|------|
| **十分な長さ** | 短いIDは総当たり攻撃で推測可能。128ビット（32文字の16進数）以上が推奨 |
| **暗号論的に安全な乱数** | `Math.random()` は予測可能。`crypto.randomBytes()` 等を使用すること |
| **推測困難性** | 連番やタイムスタンプベースのIDは予測可能なため使ってはいけない |
| **一意性** | 異なるセッションに同じIDが割り当てられてはいけない |

### 安全でないセッションID生成の例

```typescript
// ⚠️ 危険: 連番ベースのセッションID
let counter = 1;
function generateSessionId() {
  return `session_${counter++}`;  // session_1, session_2, session_3...
  // → 攻撃者は次のIDを容易に推測できる
}

// ⚠️ 危険: Math.random()ベース
function generateSessionId() {
  return Math.random().toString(36).substring(2);
  // → Math.random()は暗号論的に安全ではなく、内部状態から予測可能
}

// ⚠️ 危険: タイムスタンプベース
function generateSessionId() {
  return `sid_${Date.now()}`;
  // → 時刻を知っていれば推測可能
}
```

### 安全なセッションID生成の例

```typescript
import { randomBytes } from 'crypto';

// ✅ 安全: 暗号論的に安全な乱数を使用
function generateSessionId(): string {
  return randomBytes(32).toString('hex');
  // → 64文字の16進数（256ビット）のランダムな文字列
  // 例: "a3f2b8c4d1e6f0987654321abcdef01234567890abcdef1234567890abcdef01"
}
```

---

## セッションIDの格納場所の比較

セッションIDをクライアントに保持させる方法は複数あり、それぞれセキュリティ特性が異なる。

### Cookie

```
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax
```

| 利点 | 欠点 |
|------|------|
| ブラウザが自動送信（実装が楽） | CSRF攻撃のリスク（SameSiteで緩和可能） |
| HttpOnlyでXSSからの窃取を防止可能 | サードパーティCookieの制限が進んでいる |
| Secureでhttps限定にできる | |

**最も推奨される方式**。適切な属性（HttpOnly, Secure, SameSite）を設定すれば、安全性と利便性のバランスが良い。

### URLパラメータ

```
http://example.com/profile?session_id=abc123
```

| 利点 | 欠点 |
|------|------|
| Cookieが使えない環境で使用可能 | **Refererヘッダで外部に漏洩する** |
| | ブラウザ履歴に残る |
| | URLの共有やブックマークでセッションが漏洩する |
| | サーバーログに記録される |
| | ショルダーサーフィン（画面の覗き見）で漏洩 |

**セキュリティ上、URLでのセッションID送信は避けるべき**。やむを得ない場合は、Referer制御とセッションの短寿命化を徹底する。

### hiddenパラメータ

```html
<form action="/api/transfer" method="POST">
  <input type="hidden" name="session_id" value="abc123">
  <input type="hidden" name="amount" value="1000">
  <button type="submit">送金</button>
</form>
```

| 利点 | 欠点 |
|------|------|
| URLに露出しない | ページ遷移ごとにhiddenフィールドを含める必要がある |
| GETリクエストに含まれない | **HTMLソースを見れば値が分かる**（開発者ツールで確認可能） |
| | SPAでは使いにくい |

---

## hiddenパラメータの仕組みとセキュリティ上の注意点

hiddenパラメータはフォーム上でユーザーに見せずにデータを送信するための仕組みである。セッションIDの格納以外にも、CSRFトークンや各種IDの送信に広く使われる。

### 基本的な仕組み

```html
<!-- HTMLソース上にはあるが、ブラウザ画面には表示されない -->
<form action="/api/purchase" method="POST">
  <input type="hidden" name="product_id" value="42">
  <input type="hidden" name="price" value="1000">
  <input type="text" name="quantity" value="1">
  <button type="submit">購入</button>
</form>
```

### セキュリティ上の注意点

hiddenパラメータの値は「見えない」だけであり、**改ざんは容易**である。

```bash
# DevToolsのElementsタブでhiddenフィールドの値を変更可能
# 例: price を 1000 → 1 に変更して送信

# curlならhiddenフィールドの制約は無関係
curl -X POST http://localhost:3000/api/purchase \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "product_id=42&price=1&quantity=100"
```

**原則**: hiddenパラメータはクライアント側の値であり、**信頼してはいけない**。サーバー側で必ず検証すること。

| 用途 | hiddenパラメータの適切さ |
|------|--------------------------|
| CSRFトークン | 適切（サーバー側で検証する） |
| 商品ID（参照用） | 適切（サーバー側で価格を再取得する） |
| 価格（そのまま使う） | **不適切**（改ざんされた値をそのまま課金に使ってしまう） |
| セッションID | 非推奨（Cookieの方が安全） |

---

## まとめ

HTTPとセッション管理の理解は、Webセキュリティの土台である。ここで紹介した概念は、以下のハンズオンラボで実際に手を動かして体験できる。

| 概念 | 関連する攻撃・問題 |
|------|---------------------|
| HTTPヘッダの公開性 | 情報漏洩（ヘッダリーク） |
| GETパラメータの可視性 | Referer経由の情報漏洩 |
| ステータスコードの違い | ユーザー列挙攻撃 |
| Cookieの自動送信 | CSRF攻撃 |
| セッションIDの推測可能性 | セッションハイジャック |
| hiddenパラメータの改ざん | 価格改ざん、権限バイパス |

---

## 関連ラボ

以下のラボで、本ドキュメントの知識を実際に試すことができる:

### Step 01: 偵察

| ラボ | 関連する知識 |
|------|--------------|
| [HTTPレスポンスヘッダーからの情報漏洩](../step01-recon/header-leakage.md) | HTTPレスポンスヘッダの構造、公開性 |
| [不要なヘッダー露出](../step01-recon/header-exposure.md) | セキュリティヘッダの役割 |
| [エラーメッセージからの情報漏洩](../step01-recon/error-message-leakage.md) | ステータスコードとエラーメッセージの扱い |

### Step 03: 認証

| ラボ | 関連する知識 |
|------|--------------|
| [デフォルト認証情報](../step03-auth/default-credentials.md) | 認証の基本、Basic認証 |
| [ブルートフォース攻撃](../step03-auth/brute-force.md) | 認証の仕組み、パスワードの強度 |
| [脆弱なパスワードポリシー](../step03-auth/weak-password-policy.md) | 認証の要件 |
| [平文パスワード保存](../step03-auth/plaintext-password.md) | 認証情報の安全な管理 |

### Step 04: セッション管理

| ラボ | 関連する知識 |
|------|--------------|
| [セッションハイジャック](../step04-session/session-hijacking.md) | セッションIDの要件、Cookie属性 |
| [セッション固定攻撃](../step04-session/session-fixation.md) | セッションIDの管理 |
| [Cookie操作](../step04-session/cookie-manipulation.md) | Cookie属性の理解 |
| [CSRF](../step04-session/csrf.md) | Cookieの自動送信、SameSite属性 |

---

## 参考資料

- [MDN - HTTP の概要](https://developer.mozilla.org/ja/docs/Web/HTTP/Overview)
- [MDN - HTTP Cookie の使用](https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies)
- [OWASP - Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [RFC 7617 - The 'Basic' HTTP Authentication Scheme](https://datatracker.ietf.org/doc/html/rfc7617)
- [RFC 6265 - HTTP State Management Mechanism (Cookie)](https://datatracker.ietf.org/doc/html/rfc6265)
