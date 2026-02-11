# XSS ラボ — React フロントエンド実装ガイド

## 背景: React の XSS 防御メカニズム

React の JSX は、レンダリング時にすべての値を **自動的にエスケープ** する。
これにより、通常の使い方では XSS が発生しない。

```tsx
// 安全: React が自動エスケープする
const userInput = '<script>alert("XSS")</script>';
return <div>{userInput}</div>;
// 出力: <div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
// → スクリプトは実行されず、テキストとして表示される
```

React は内部的に `textContent` 相当の処理で DOM に値をセットするため、
HTML タグとして解釈されることはない。

### なぜラボで XSS を再現するのに工夫が必要か

従来のサーバーサイドレンダリング (PHP, EJS 等) では、ユーザー入力を HTML にそのまま埋め込むだけで XSS が発生した。
しかし React では JSX の自動エスケープがあるため、**意図的にエスケープを回避する API を使う** 必要がある。

---

## React で XSS を意図的に再現する手法

### 1. `dangerouslySetInnerHTML` (メイン手法)

HTML 文字列をそのまま DOM に挿入する React 公式の API。名前自体が「危険」であることを示している。

```tsx
// ⚠️ 脆弱: HTML がそのまま解釈される
const userInput = '<img src=x onerror=alert("XSS")>';
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
// → onerror が発火し alert が表示される
```

**XSS ラボではこの手法をメインで使用する。** 理由:

- React 固有の API であり、React を学ぶ文脈で最も教育的
- 「名前に dangerous が入っているのに使ってしまう」という現実のアンチパターンを体験できる
- 安全版との対比が明確 (通常の JSX に変えるだけで防げる)

### 2. `javascript:` スキーム in href

`<a>` タグの `href` にユーザー入力をそのまま渡すと、`javascript:` プロトコルで任意のコードが実行される。

```tsx
// ⚠️ 脆弱: javascript: スキームが実行される
const userUrl = 'javascript:alert("XSS")';
return <a href={userUrl}>リンク</a>;
// → クリックすると alert が実行される
```

React 16.9+ で `javascript:` URL に対して警告が出るが、**ブロックはされない**。

**対策**:

```tsx
// ✅ 安全: プロトコルを検証する
const isSafe = /^https?:\/\//.test(userUrl);
return <a href={isSafe ? userUrl : '#'}>リンク</a>;
```

### 3. `eval()` / `new Function()`

ユーザー入力を JavaScript コードとして実行してしまうパターン。

```tsx
// ⚠️ 脆弱: ユーザー入力をコードとして実行
const userExpr = 'alert("XSS")';
eval(userExpr);
```

React 固有ではないが、フロントエンドで `eval` を使うケース (計算機アプリ等) で発生しうる。

### 4. `ref` + `innerHTML` 直接操作

React の `ref` を使って DOM 要素に直接アクセスし、`innerHTML` を設定するパターン。

```tsx
// ⚠️ 脆弱: React の管理外で innerHTML を操作
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (ref.current) {
    ref.current.innerHTML = userInput; // React のエスケープを完全に回避
  }
}, [userInput]);
return <div ref={ref} />;
```

サードパーティライブラリとの統合時に発生しやすい。

---

## 各 XSS ラボの推奨実装パターン

### Reflected XSS

検索クエリがそのままレスポンスに反映される攻撃。

#### バックエンド (`backend/src/labs/xss.ts`)

```
POST /api/labs/xss/vulnerable/search
  リクエスト: { "q": "<img src=x onerror=alert(1)>" }
  レスポンス: { "query": "<img src=x onerror=alert(1)>", "results": [...] }
  → q をサニタイズせずそのまま返す

POST /api/labs/xss/secure/search
  リクエスト: { "q": "<img src=x onerror=alert(1)>" }
  レスポンス: { "query": "&lt;img src=x onerror=alert(1)&gt;", "results": [...] }
  → q をエスケープして返す
```

ポイント: バックエンドは JSON で返す。HTML レスポンスではない。
XSS が発生するかどうかは **フロントエンドがどうレンダリングするか** で決まる。

#### フロントエンド (`frontend/src/pages/ReflectedXss.tsx`)

```tsx
// ⚠️ 脆弱版: dangerouslySetInnerHTML でレンダリング
// 脆弱な理由: API から返された文字列を HTML として解釈してしまう
<div dangerouslySetInnerHTML={{ __html: `検索結果: ${response.query}` }} />

// ✅ 安全版: 通常の JSX でレンダリング
// 安全な理由: React の JSX が自動的に文字列をエスケープする
<div>検索結果: {response.query}</div>
```

**攻撃例**: 検索ボックスに `<img src=x onerror=alert('XSS')>` を入力

### Stored XSS

投稿内容に埋め込まれたスクリプトが、他のユーザーの閲覧時に実行される攻撃。

#### バックエンド (`backend/src/labs/xss.ts`)

```
POST /api/labs/xss/vulnerable/posts
  → content をサニタイズせず DB (posts テーブル) に保存
GET  /api/labs/xss/vulnerable/posts
  → DB から取得した content をそのまま返す

POST /api/labs/xss/secure/posts
  → content をサニタイズ (HTML タグ除去) してから DB に保存
GET  /api/labs/xss/secure/posts
  → DB から取得した content をそのまま返す (保存時にサニタイズ済み)
```

DB 接続は `backend/src/db/pool.ts` の `getPool()` を使用。
テーブルは `docker/db/init.sql` の `posts` を利用。

#### フロントエンド (`frontend/src/pages/StoredXss.tsx`)

```tsx
// ⚠️ 脆弱版: 投稿内容を dangerouslySetInnerHTML で表示
// 脆弱な理由: DB に保存されたスクリプトが HTML として実行される
{posts.map(post => (
  <div key={post.id} dangerouslySetInnerHTML={{ __html: post.content }} />
))}

// ✅ 安全版: 通常の JSX で表示
// 安全な理由: React が自動エスケープするため、タグはテキストとして表示される
{posts.map(post => (
  <div key={post.id}>{post.content}</div>
))}
```

**攻撃例**: 投稿フォームに `<img src=x onerror=alert('Stored XSS')>` を入力して投稿

### DOM-based XSS

**バックエンド不要。** クライアント側の JavaScript が URL フラグメント等を安全でない方法で DOM に挿入する攻撃。

#### フロントエンド (`frontend/src/pages/DomXss.tsx`)

```tsx
// ⚠️ 脆弱版: location.hash を dangerouslySetInnerHTML で表示
// 脆弱な理由: URL のフラグメントがそのまま HTML として解釈される
const [hash, setHash] = useState('');
useEffect(() => {
  const onHashChange = () => setHash(decodeURIComponent(location.hash.slice(1)));
  window.addEventListener('hashchange', onHashChange);
  onHashChange(); // 初回読み込み
  return () => window.removeEventListener('hashchange', onHashChange);
}, []);

return <div dangerouslySetInnerHTML={{ __html: hash }} />;

// ✅ 安全版: 通常の JSX でレンダリング
// 安全な理由: React が自動エスケープする
return <div>{hash}</div>;
```

**攻撃例**: URL に `#<img src=x onerror=alert('DOM XSS')>` を付与してアクセス

---

## 脆弱版/安全版の切り替え UI パターン

各ラボページで **タブ切り替え** により脆弱版と安全版を切り替える:

```tsx
const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');

return (
  <div>
    <div role="tablist">
      <button role="tab" aria-selected={mode === 'vulnerable'}
              onClick={() => setMode('vulnerable')}>
        脆弱版
      </button>
      <button role="tab" aria-selected={mode === 'secure'}
              onClick={() => setMode('secure')}>
        安全版
      </button>
    </div>

    {mode === 'vulnerable' ? <VulnerableView /> : <SecureView />}
  </div>
);
```

API エンドポイントの規約:

- 脆弱版: `/api/labs/xss/vulnerable/...`
- 安全版: `/api/labs/xss/secure/...`

---

## 既存プロジェクト資産の参照

| リソース | パス | 用途 |
|---|---|---|
| XSS ラボ概要 | `docs/step02-injection/xss.md` | 各ラボの概要・攻撃例・難易度 |
| DB スキーマ | `docker/db/init.sql` | `posts` テーブル (Stored XSS で使用) |
| DB 接続 | `backend/src/db/pool.ts` | `getPool()` で PostgreSQL に接続 |
| 開発ガイド | `CLAUDE.md` | ラボ追加手順・コーディング規約 |

---

## コメント規約 (CLAUDE.md 準拠)

- **脆弱なコード**: 何が脆弱なのかコメントで明記する

  ```tsx
  // ⚠️ 脆弱: dangerouslySetInnerHTML でユーザー入力を HTML として挿入している
  // 攻撃者は <script> や onerror 属性を使って任意の JavaScript を実行できる
  ```

- **安全なコード**: なぜ安全なのかコメントで説明する

  ```tsx
  // ✅ 安全: React の JSX は自動的に文字列をエスケープするため、
  // HTML タグはテキストとして表示され、スクリプトは実行されない
  ```
