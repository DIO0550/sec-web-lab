# Token Replay — ログアウト後のトークン再利用

> ログアウトしたはずなのに、保存しておいたトークンを使えば引き続きアカウントにアクセスできてしまう脆弱性を学びます。

---

## 対象ラボ

| 項目 | 内容 |
|------|------|
| **概要** | ログアウト処理がクライアント側のトークン削除のみで、サーバー側でトークンを無効化しないため、保存済みのトークンで認証をバイパスできる |
| **攻撃例** | `curl -H "Authorization: Bearer <ログアウト済みのJWT>" http://localhost:3000/api/labs/token-replay/vulnerable/profile` |
| **技術スタック** | Hono API + JWT (jsonwebtoken) |
| **難易度** | ★★☆ 中級 |
| **前提知識** | JWT/セッション管理の基本、ログアウト処理の仕組み |

---

## この脆弱性を理解するための前提

### JWT によるステートレス認証の仕組み

JWT（JSON Web Token）は、サーバーが秘密鍵で署名したトークンをクライアントに発行し、以降のリクエストでそのトークンを提示させることで認証を行う仕組みである。サーバーはトークンの署名を検証するだけで、データベースへの問い合わせなしにユーザーを識別できる。

```
ログイン成功時:
POST /api/login → 200 OK
{ "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UiLCJleHAiOjE3MzU2MDAwMDB9.xxxxx" }

以降のリクエスト:
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
→ 200 OK: { "username": "alice", "email": "alice@example.com" }
```

JWT のペイロードには `exp`（有効期限）クレームが含まれるが、典型的には1時間〜数日に設定される。有効期限内であれば、トークンを持つ誰もがそのユーザーとして認証される。

### どこに脆弱性が生まれるのか

JWT はステートレスであるため、「このトークンは無効」という情報をサーバー側で管理しない限り、一度発行されたトークンは有効期限まで永久に有効である。多くの実装では、ログアウト処理を「クライアント側の localStorage や Cookie からトークンを削除する」だけで済ませてしまう。

```typescript
// ⚠️ この部分が問題 — ログアウトがクライアント側の削除のみ
app.post('/logout', (c) => {
  // サーバー側では何もしない
  // クライアント側で localStorage.removeItem('token') するだけ
  return c.json({ message: 'ログアウトしました' });
});

// ⚠️ トークン検証時にブラックリストを確認しない
app.get('/profile', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  const payload = verify(token, SECRET_KEY); // 署名と有効期限のみ検証
  // → ログアウト済みかどうかは一切チェックしない
  return c.json({ user: payload.user });
});
```

問題の本質は、ログアウトが「意図の表明」に過ぎず、トークン自体の無効化を伴わないことにある。攻撃者（または共有端末の次のユーザー）がログアウト前にトークンをコピーしていれば、ログアウト後もそのトークンで認証が通ってしまう。

---

## 攻撃の仕組み

![攻撃フロー](diagrams/token-replay-attack.svg)

### 攻撃のシナリオ

1. **攻撃者** がトークンを入手する

   攻撃者は以下のいずれかの方法でJWTを取得する:
   - 共有端末のブラウザの DevTools → Application → Local Storage からトークンをコピーする
   - ネットワーク傍受（HTTPS でない場合）で `Authorization` ヘッダーからトークンを取得する
   - XSS 脆弱性を利用して `localStorage` からトークンを読み取る
   - ブラウザの履歴やログファイルからトークンを取得する

   ```
   取得したトークン:
   eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWxpY2UiLCJleHAiOjE3MzU2ODYwMDB9.abc123
   ```

2. **被害者** がログアウトする

   被害者がログアウトボタンを押すと、クライアント側の JavaScript が `localStorage` からトークンを削除する。しかしサーバー側ではトークンの失効処理が行われないため、トークン自体は依然として有効なままである。

   ```javascript
   // クライアント側のログアウト処理
   function logout() {
     localStorage.removeItem('token'); // ブラウザからは消えるが...
     window.location.href = '/login';
   }
   // → サーバー側のトークンは有効期限まで生き続ける
   ```

3. **攻撃者** が保存済みトークンで被害者のアカウントにアクセスする

   攻撃者は事前にコピーしておいたトークンを使って API にリクエストを送信する。サーバーはトークンの署名と有効期限を検証するが、ログアウト済みかどうかは確認しないため、リクエストは正常に認証される。

   ```bash
   # ログアウト後でもトークンが有効
   curl http://localhost:3000/api/labs/token-replay/vulnerable/profile \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWxpY2UiLCJleHAiOjE3MzU2ODYwMDB9.abc123"
   # → 200 OK: { "username": "alice", "email": "alice@example.com" }
   ```

### なぜ成功するのか

| 条件 | 説明 |
|------|------|
| サーバー側にトークン失効機構がない | ログアウト時にトークンをブラックリストに登録する仕組みがないため、発行済みトークンは有効期限まで無条件に受け入れられる |
| ログアウトがクライアント側の処理のみ | `localStorage.removeItem('token')` はブラウザ上のトークンを消すだけで、トークンのコピーが他に存在すれば意味がない |
| トークンの有効期限が長い | `exp` が数時間〜数日後に設定されている場合、攻撃者に十分な時間を与えてしまう |

### 被害の範囲

- **機密性**: 攻撃者が被害者のアカウントとして個人情報、メッセージ、取引履歴にフルアクセスできる。被害者がログアウトで安全を確保したつもりでも、トークンが有効期限まで使えてしまう
- **完全性**: 被害者のアカウントでデータの変更、投稿の作成・編集・削除、設定変更が可能。被害者はログアウト済みのため、不正操作に気づきにくい
- **可用性**: 攻撃者がパスワードやメールアドレスを変更すると、被害者はアカウントを永続的に失う。ログアウト後に乗っ取られるため、被害の発覚が遅れやすい

---

## 対策

![対策フロー](diagrams/token-replay-defense.svg)

### 根本原因

JWT のステートレスな性質により、一度発行されたトークンはサーバー側で明示的に無効化しない限り、有効期限まで永久に有効である。ログアウト処理がクライアント側のトークン削除のみにとどまり、サーバー側でトークンの失効状態を管理していないことが根本的な問題である。

### 安全な実装

サーバー側にトークンのブラックリスト（失効リスト）を実装する。ログアウト時にトークンをブラックリストに登録し、認証ミドルウェアでブラックリストをチェックすることで、ログアウト済みトークンの再利用を防ぐ。

加えて、トークンの有効期限を短く設定し（例: 15分）、リフレッシュトークンによるローテーションを組み合わせることで、トークンが漏洩した場合の被害を最小化できる。

```typescript
// ✅ サーバー側でトークンの失効状態を管理する

// ブラックリスト（本番環境では Redis 等を使用）
const tokenBlacklist = new Set<string>();

// ログアウト時にトークンをブラックリストに登録
app.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    // ✅ トークンをブラックリストに追加 — サーバー側で失効を管理
    tokenBlacklist.add(token);
  }
  return c.json({ message: 'ログアウトしました' });
});

// 認証ミドルウェアでブラックリストを確認
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  // ✅ ブラックリストに含まれるトークンを拒否
  if (tokenBlacklist.has(token)) {
    return c.json({ error: 'トークンは無効化されています' }, 401);
  }

  try {
    const payload = verify(token, SECRET_KEY);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: '認証に失敗しました' }, 401);
  }
};
```

リフレッシュトークンローテーションを組み合わせた実装:

```typescript
// ✅ 短い有効期限のアクセストークン + リフレッシュトークンローテーション
app.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  const user = await authenticateUser(username, password);

  // ✅ アクセストークンは15分で失効 — 漏洩時の被害期間を最小化
  const accessToken = sign(
    { userId: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: '15m' }
  );

  // ✅ リフレッシュトークンは7日間有効、使用時にローテーション
  const refreshToken = crypto.randomUUID();
  await saveRefreshToken(user.id, refreshToken);

  return c.json({ accessToken, refreshToken });
});

// ✅ リフレッシュ時にトークンをローテーション — 古いリフレッシュトークンは無効化
app.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json();
  const userId = await validateAndRevokeRefreshToken(refreshToken);
  if (!userId) {
    return c.json({ error: 'リフレッシュトークンが無効です' }, 401);
  }

  const newAccessToken = sign({ userId }, SECRET_KEY, { expiresIn: '15m' });
  const newRefreshToken = crypto.randomUUID();
  await saveRefreshToken(userId, newRefreshToken);

  return c.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});
```

#### 脆弱 vs 安全: コード比較

```diff
  app.post('/logout', async (c) => {
-   // クライアント側でトークンを削除するだけ — サーバー側は何もしない
-   return c.json({ message: 'ログアウトしました' });
+   const token = c.req.header('Authorization')?.replace('Bearer ', '');
+   if (token) {
+     tokenBlacklist.add(token);  // サーバー側でトークンを失効させる
+   }
+   return c.json({ message: 'ログアウトしました' });
  });

  const authMiddleware = async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
+   if (tokenBlacklist.has(token)) {
+     return c.json({ error: 'トークンは無効化されています' }, 401);
+   }
    const payload = verify(token, SECRET_KEY);
    c.set('user', payload);
    await next();
  };
```

脆弱なコードでは、ログアウト処理が空の応答を返すだけでトークンに対して何もしない。安全なコードでは、ログアウト時にトークンをブラックリストに追加し、認証ミドルウェアでブラックリストを照会することで、ログアウト済みトークンによるアクセスをサーバー側で遮断する。

### その他の防御策

| 対策 | 種類 | 説明 |
|------|------|------|
| サーバー側トークンブラックリスト | 根本対策 | ログアウト時にトークンを失効リストに登録し、認証時にチェックする。これが最も直接的な対策 |
| 短い有効期限 + リフレッシュトークン | 根本対策 | アクセストークンを15分程度の短命にし、リフレッシュトークンで更新する。漏洩時の被害期間を大幅に削減 |
| リフレッシュトークンローテーション | 多層防御 | リフレッシュ時に古いトークンを無効化し新しいトークンを発行する。リフレッシュトークンの再利用を検知可能 |
| トークンの安全な保管 | 多層防御 | `localStorage` ではなく `HttpOnly` Cookie にトークンを保存し、XSS によるトークン窃取を防止する |
| 異常検知 | 検知 | 同一トークンが異なる IP やデバイスから使用された場合にアラートを発し、トークンを自動失効させる |

---

## ハンズオン手順

### Step 1: 脆弱バージョンで攻撃を体験

**ゴール**: ログアウト後もトークンが有効であり、保存済みトークンでアカウントにアクセスできることを確認する

1. 開発サーバーを起動する

   ```bash
   cd backend && pnpm dev
   ```

2. ユーザー（alice）でログインし、JWT トークンを取得する

   ```bash
   # ログインしてトークンを取得
   curl -X POST http://localhost:3000/api/labs/token-replay/vulnerable/login \
     -H "Content-Type: application/json" \
     -d '{"username": "alice", "password": "password123"}'
   # → { "token": "eyJhbGciOiJIUzI1NiJ9..." }
   ```

3. 取得したトークンでプロフィールにアクセスできることを確認する

   ```bash
   # トークンを使ってプロフィールを取得
   curl http://localhost:3000/api/labs/token-replay/vulnerable/profile \
     -H "Authorization: Bearer <取得したトークン>"
   # → { "username": "alice", "email": "alice@example.com" }
   ```

4. トークンを別の場所に保存してからログアウトする

   ```bash
   # トークンを変数に保存（攻撃者がコピーする想定）
   STOLEN_TOKEN="<取得したトークン>"

   # ログアウト
   curl -X POST http://localhost:3000/api/labs/token-replay/vulnerable/logout \
     -H "Authorization: Bearer $STOLEN_TOKEN"
   # → { "message": "ログアウトしました" }
   ```

5. ログアウト後に保存済みトークンで再度アクセスする

   ```bash
   # ログアウト後でもトークンが使える！
   curl http://localhost:3000/api/labs/token-replay/vulnerable/profile \
     -H "Authorization: Bearer $STOLEN_TOKEN"
   # → 200 OK: { "username": "alice", "email": "alice@example.com" }
   ```

6. 結果を確認する

   - ログアウト後にもかかわらず、保存済みトークンで正常にプロフィール情報が返される
   - **この結果が意味すること**: ログアウトがクライアント側の処理だけでは、サーバー側でトークンが依然として有効であり、コピーさえあれば誰でもアクセスできる

### Step 2: 安全バージョンで防御を確認

**ゴール**: 同じ手順でログアウト後にトークンが無効化され、再利用できないことを確認する

1. 安全なエンドポイントでログインし、トークンを取得する

   ```bash
   curl -X POST http://localhost:3000/api/labs/token-replay/secure/login \
     -H "Content-Type: application/json" \
     -d '{"username": "alice", "password": "password123"}'
   # → { "token": "eyJhbGciOiJIUzI1NiJ9..." }
   ```

2. トークンを保存してからログアウトする

   ```bash
   SAVED_TOKEN="<取得したトークン>"

   # 安全なエンドポイントでログアウト
   curl -X POST http://localhost:3000/api/labs/token-replay/secure/logout \
     -H "Authorization: Bearer $SAVED_TOKEN"
   # → { "message": "ログアウトしました" }
   ```

3. ログアウト後に保存済みトークンで再度アクセスを試みる

   ```bash
   # 安全バージョンではログアウト後のトークンが拒否される
   curl http://localhost:3000/api/labs/token-replay/secure/profile \
     -H "Authorization: Bearer $SAVED_TOKEN"
   # → 401 Unauthorized: { "error": "トークンは無効化されています" }
   ```

4. コードの差分を確認する

   - `backend/src/labs/step04-session/token-replay.ts` の脆弱版と安全版を比較
   - **どの行が違いを生んでいるか** に注目: ログアウト時の `tokenBlacklist.add(token)` と認証時の `tokenBlacklist.has(token)` チェック

### 確認ポイント

以下を自分の言葉で説明できれば、このラボは完了です:

- [ ] JWT のステートレスな性質が、なぜトークン再利用の脆弱性につながるのか
- [ ] クライアント側のトークン削除だけではなぜ不十分なのか
- [ ] トークンブラックリストは「なぜ」ログアウト後のアクセスを防げるのか（ステートレスからステートフルへの変化）
- [ ] 短い有効期限 + リフレッシュトークンローテーションが多層防御として有効な理由

---

## 実装メモ

| 項目 | パス |
|------|------|
| 脆弱エンドポイント | `/api/labs/token-replay/vulnerable/login`, `/api/labs/token-replay/vulnerable/logout`, `/api/labs/token-replay/vulnerable/profile` |
| 安全エンドポイント | `/api/labs/token-replay/secure/login`, `/api/labs/token-replay/secure/logout`, `/api/labs/token-replay/secure/profile` |
| バックエンド | `backend/src/labs/step04-session/token-replay.ts` |
| フロントエンド | `frontend/src/labs/step04-session/pages/TokenReplay.tsx` |

- 脆弱版ではログアウト処理でサーバー側のトークン管理を行わず、`verify()` のみで認証する
- 安全版では `Set`（本番では Redis）によるトークンブラックリストを実装し、ログアウト時にトークンを登録、認証時にチェックする
- JWT の `exp` は脆弱版では長め（24時間）、安全版では短め（15分）に設定して差を体感させる
- リフレッシュトークンの実装は安全版のみに含め、ローテーションの仕組みを確認できるようにする

---

## 現実世界での事例

| 年 | インシデント | 概要 |
|----|-------------|------|
| 2019 | Zoom JWT 脆弱性 | Zoom の Web クライアントで JWT の失効処理が不十分であり、ログアウト後もトークンが有効な状態が続く問題が報告された。共有端末での利用時にセッションが乗っ取られるリスクがあった |
| 2023 | CircleCI セキュリティインシデント | CircleCI のセキュリティ侵害で、ユーザーのセッショントークンが漏洩。トークンの即時失効が適切に行われなかったため、漏洩トークンによる不正アクセスの期間が長期化した |

---

## 関連ラボ

| ラボ | 関連性 |
|------|--------|
| [Session Hijacking](./session-hijacking.md) | セッションハイジャックで盗んだトークンは、ログアウト後も有効であればそのまま再利用できる。トークン窃取と再利用は連続した攻撃チェーンを形成する |
| [Session Expiration](./session-expiration.md) | セッション有効期限の不備とトークン再利用は密接に関連する。有効期限が長いほどトークン再利用の攻撃ウィンドウが広がる |
| [XSS (Stored XSS)](../step02-injection/xss.md) | XSS で `localStorage` からトークンを窃取すると、そのトークンをログアウト後も再利用できる |

---

## 参考資料

- [OWASP - Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP - JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [CWE-613: Insufficient Session Expiration](https://cwe.mitre.org/data/definitions/613.html)
