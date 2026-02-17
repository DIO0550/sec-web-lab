# JWT Vulnerabilities — トークンの改ざんで認証をバイパスする

> JWT（JSON Web Token）の署名検証の不備を突いて、一般ユーザーのトークンを管理者権限に書き換えたり、署名をバイパスしてなりすましを行う脆弱性を学びます。

---

## 対象ラボ

### 1. alg=none 攻撃

| 項目 | 内容 |
|------|------|
| **概要** | JWT ヘッダーのアルゴリズムを `none` に変更し、署名部分を空にすることで署名検証をバイパスする |
| **攻撃例** | JWT ヘッダーの `alg` を `none` に変更し、署名部分を削除して送信 → サーバーが署名なしトークンを受け入れる |
| **技術スタック** | Hono API + JWT ライブラリ |
| **難易度** | ★★★ 上級 |
| **前提知識** | JWT の構造（ヘッダー・ペイロード・署名）、Base64URL エンコーディング、HTTP 認証ヘッダー |

### 2. 弱い秘密鍵によるトークン偽造

| 項目 | 内容 |
|------|------|
| **概要** | 短い・推測可能な秘密鍵で JWT が署名されており、ブルートフォースや辞書攻撃で鍵を特定してトークンを偽造できる |
| **攻撃例** | `secret`、`password`、`key123` 等のよくある鍵で JWT を再署名し、`role: admin` に書き換える |
| **技術スタック** | Hono API + JWT |
| **難易度** | ★★★ 上級 |
| **前提知識** | JWT の署名検証の仕組み、HMAC の基本、Base64URL エンコーディング |

---

## この脆弱性を理解するための前提

### JWT の仕組み

JWT（JSON Web Token）は、ユーザーの認証情報や権限をトークンに含めてクライアントに渡す仕組み。トークンは 3 つの部分で構成される:

```
ヘッダー.ペイロード.署名
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoidXNlciJ9.署名部分
```

- **ヘッダー**: 署名アルゴリズム（`HS256` 等）を指定
- **ペイロード**: ユーザー情報や有効期限（`{"user": "alice", "role": "user"}`）
- **署名**: ヘッダーとペイロードを秘密鍵で署名したもの。改ざんを検知するための要

```typescript
// JWT の生成（正常なフロー）
const token = jwt.sign(
  { user: 'alice', role: 'user' },  // ペイロード
  'very-long-random-secret-key',     // 秘密鍵
  { algorithm: 'HS256' }             // アルゴリズム
);
// → サーバーはこのトークンをクライアントに返す

// JWT の検証（正常なフロー）
const payload = jwt.verify(token, 'very-long-random-secret-key');
// → 署名が正しければペイロードを返す
```

サーバーはリクエスト受信時にトークンの署名を検証し、改ざんされていないことを確認してからペイロードの情報を信頼する。

### どこに脆弱性が生まれるのか

問題は 2 つのパターンで発生する:

**パターン 1: `alg: none` を受け入れてしまう**

```typescript
// ⚠️ この部分が問題 — アルゴリズムの指定なしに検証している
app.use('/api/admin/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  // verify がトークン内の alg フィールドを信頼してしまう
  // alg=none の場合、署名検証がスキップされる
  const payload = jwt.verify(token, SECRET_KEY);
  c.set('user', payload);
  await next();
});
```

**パターン 2: 弱い秘密鍵を使っている**

```typescript
// ⚠️ この部分が問題 — 秘密鍵が短く推測可能
const SECRET_KEY = 'secret';  // 辞書攻撃で簡単に特定できる

const token = jwt.sign({ user: 'alice', role: 'user' }, SECRET_KEY);
```

---

## 攻撃の仕組み

![攻撃フロー](diagrams/jwt-vulnerabilities-attack.svg)

### 攻撃のシナリオ

#### シナリオ 1: alg=none 攻撃

1. **攻撃者** が正規ユーザーとしてログインし、JWT を取得する

   ```
   eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoidXNlciJ9.xxxx
   ```

2. **攻撃者** が JWT をデコードし、ヘッダーとペイロードを書き換える

   ヘッダーの `alg` を `none` に、ペイロードの `role` を `admin` に変更する:

   ```json
   // ヘッダー（改ざん後）
   {"alg": "none"}
   // ペイロード（改ざん後）
   {"user": "alice", "role": "admin"}
   ```

   Base64URL エンコードし、署名部分を空にして新しいトークンを組み立てる:

   ```
   eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ.
   ```

3. **攻撃者** が改ざんしたトークンで管理者エンドポイントにアクセスする

   ```bash
   curl http://localhost:3000/api/labs/jwt/vulnerable/admin/users \
     -H "Authorization: Bearer eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ."
   ```

4. **サーバー** が `alg: none` を受け入れ、署名検証をスキップして管理者としてリクエストを処理する

   JWT ライブラリが `alg` フィールドをそのまま信頼するため、`none` が指定されると署名検証が行われない。攻撃者は秘密鍵を知らなくても、任意のペイロードを持つ有効なトークンを作成できる。

#### シナリオ 2: 弱い秘密鍵の推測

1. **攻撃者** が取得した JWT に対して、よくある秘密鍵で署名検証を試みる

   ```bash
   # よくある秘密鍵のリストで総当たり
   for key in secret password key123 jwt_secret admin; do
     jwt.verify(token, key) && echo "鍵が見つかった: $key"
   done
   ```

2. **攻撃者** が鍵 `secret` で署名が一致することを発見し、`role: admin` に変更したペイロードで再署名する

   秘密鍵が判明すれば、サーバーが受け入れる正規の署名を持つトークンを自由に生成できる。

### なぜ成功するのか

| 条件 | 説明 |
|------|------|
| `alg: none` の受け入れ | JWT ライブラリがトークン内の `alg` フィールドを検証時のアルゴリズムとして信頼してしまう。`none` は「署名なし」を意味し、検証がスキップされる |
| 弱い秘密鍵 | `secret` や `password` のような短く推測可能な鍵は、辞書攻撃やブルートフォースで短時間で特定できる |
| サーバー側でのアルゴリズム固定がない | 検証時に使用するアルゴリズムをサーバー側で明示的に指定していないため、トークン内の `alg` がそのまま使われる |

### 被害の範囲

- **機密性**: 管理者権限の奪取により、全ユーザーの個人情報、システム設定、ログ等にアクセス可能
- **完全性**: 管理者として任意のデータ変更、ユーザーアカウントの操作、権限の昇格が可能
- **可用性**: 管理者権限でのアカウント停止、設定変更によるサービス妨害

---

## 対策

![対策フロー](diagrams/jwt-vulnerabilities-defense.svg)

### 根本原因

サーバーが **トークン内に含まれるアルゴリズム指定を信頼してしまう** ことと、**秘密鍵の強度が不十分** であることが根本原因。JWT の `alg` フィールドは攻撃者が自由に書き換えられるクライアント側データであり、検証時にこれを信頼してはならない。

### 安全な実装

検証時にアルゴリズムをサーバー側で明示的に指定し、`none` を拒否する。さらに、十分な長さのランダムな秘密鍵を使用する。

```typescript
import { randomBytes } from 'crypto';

// ✅ 十分な長さのランダムな秘密鍵を使用
const SECRET_KEY = process.env.JWT_SECRET || randomBytes(64).toString('hex');

// ✅ 検証時にアルゴリズムをサーバー側で固定し、none を拒否
app.use('/api/admin/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: '認証が必要です' }, 401);

  try {
    const payload = jwt.verify(token, SECRET_KEY, {
      algorithms: ['HS256'],  // 許可するアルゴリズムを明示的に指定
    });
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: '無効なトークンです' }, 401);
  }
});
```

`algorithms: ['HS256']` を指定することで、トークンの `alg` が `none` や `HS384` 等に書き換えられていても検証に失敗する。サーバーが使うアルゴリズムはサーバー側のコードで決定され、トークン内の値は無視される。

#### 脆弱 vs 安全: コード比較

```diff
  // 秘密鍵
- const SECRET_KEY = 'secret';
+ const SECRET_KEY = process.env.JWT_SECRET || randomBytes(64).toString('hex');

  // JWT 検証
- const payload = jwt.verify(token, SECRET_KEY);
+ const payload = jwt.verify(token, SECRET_KEY, {
+   algorithms: ['HS256'],  // アルゴリズムを固定
+ });
```

2 つの変更点: (1) 秘密鍵を十分な長さのランダム値に変更し、推測を不可能にする。(2) 検証時にアルゴリズムを明示的に指定し、`alg: none` やアルゴリズムのすり替え攻撃を防ぐ。

### その他の防御策

| 対策 | 種類 | 説明 |
|------|------|------|
| アルゴリズムの固定 | 根本対策 | `algorithms: ['HS256']` で許可するアルゴリズムを明示的に指定する。`none` やその他の意図しないアルゴリズムを拒否 |
| 強い秘密鍵の使用 | 根本対策 | 256 ビット以上のランダムな鍵を使用する。環境変数から読み込み、コードにハードコードしない |
| トークンの有効期限 | 多層防御 | `exp` クレームで短い有効期限（例: 15 分）を設定し、トークンが漏洩した場合の被害期間を限定する |
| トークンのブラックリスト | 多層防御 | ログアウト時や不正検知時にトークンを無効化する仕組みを用意する |
| 公開鍵方式（RS256）の採用 | 多層防御 | 非対称鍵を使用し、秘密鍵を検証側に渡す必要をなくす。鍵管理のリスクを低減 |

---

## ハンズオン手順

### Step 1: 脆弱バージョンで攻撃を体験

**ゴール**: JWT の改ざんにより、一般ユーザーが管理者エンドポイントにアクセスできることを確認する

1. 開発サーバーを起動する

   ```bash
   cd backend && pnpm dev
   ```

2. 一般ユーザーとしてログインし、JWT を取得する

   ```bash
   curl -X POST http://localhost:3000/api/labs/jwt/vulnerable/login \
     -H "Content-Type: application/json" \
     -d '{"username": "alice", "password": "password123"}'
   # → { "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoidXNlciJ9.xxxx" }
   ```

3. 取得した JWT を改ざんする（alg=none 攻撃）

   ```bash
   # ヘッダー: {"alg":"none"} → eyJhbGciOiJub25lIn0
   # ペイロード: {"user":"alice","role":"admin"} → eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ
   # 署名: 空

   FORGED_TOKEN="eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ."
   ```

4. 改ざんしたトークンで管理者エンドポイントにアクセスする

   ```bash
   curl http://localhost:3000/api/labs/jwt/vulnerable/admin/users \
     -H "Authorization: Bearer ${FORGED_TOKEN}"
   ```

5. 結果を確認する

   - 管理者向けのユーザー一覧が返される
   - 本来は `role: user` のアリスが、管理者として認識されている
   - **この結果が意味すること**: サーバーがトークン内の `alg` を信頼しているため、攻撃者は署名なしで任意のペイロードを送信できる

### Step 2: 安全バージョンで防御を確認

**ゴール**: 同じ攻撃が失敗することを確認する

1. 同じ改ざんトークンを安全なエンドポイントに送信する

   ```bash
   curl http://localhost:3000/api/labs/jwt/secure/admin/users \
     -H "Authorization: Bearer ${FORGED_TOKEN}"
   ```

2. 結果を確認する

   - `401 Unauthorized` が返され、「無効なトークンです」とエラーになる
   - サーバーが `HS256` のみを許可しているため、`alg: none` のトークンは拒否される

3. コードの差分を確認する

   - `backend/src/labs/step08-advanced/jwt-vulnerabilities.ts` の脆弱版と安全版を比較
   - **どの行が違いを生んでいるか** に注目: `algorithms` オプションの有無と秘密鍵の強度

### 確認ポイント

以下を自分の言葉で説明できれば、このラボは完了です:

- [ ] JWT の 3 つの構成要素（ヘッダー・ペイロード・署名）それぞれの役割は何か
- [ ] `alg: none` 攻撃が成功する条件は何か（なぜサーバーが署名なしトークンを受け入れてしまうのか）
- [ ] `algorithms: ['HS256']` の指定は「なぜ」この攻撃を無効化するのか
- [ ] 弱い秘密鍵がなぜ危険なのか（攻撃者が鍵を特定するとどうなるか）

---

## 実装メモ

| 項目 | パス |
|------|------|
| 脆弱エンドポイント (login) | `/api/labs/jwt/vulnerable/login` |
| 脆弱エンドポイント (admin) | `/api/labs/jwt/vulnerable/admin/users` |
| 安全エンドポイント (login) | `/api/labs/jwt/secure/login` |
| 安全エンドポイント (admin) | `/api/labs/jwt/secure/admin/users` |
| バックエンド | `backend/src/labs/step08-advanced/jwt-vulnerabilities.ts` |
| フロントエンド | `frontend/src/features/step08-advanced/pages/JWTVulnerabilities.tsx` |

- 脆弱版: 弱い秘密鍵 (`secret`) を使用し、`verify` 時にアルゴリズムを指定しない
- 安全版: 強い秘密鍵 + `algorithms: ['HS256']` でアルゴリズムを固定
- フロントエンドに JWT デコーダーを組み込み、トークンの中身を確認できるようにする
- jwt.io を使ったペイロード改ざんの手順もガイドに含める

---

## 現実世界での事例

| 年 | インシデント | 概要 |
|----|-------------|------|
| 2015 | 複数の JWT ライブラリ | `alg: none` 攻撃が多数の JWT ライブラリで可能であることが報告された。Auth0 の Tim McLean による研究で広く知られるようになった |
| 2020 | Auth0 | JWT の `alg` フィールドの信頼に関する脆弱性パターンがOWASP JWT チートシートに追加された |

---

## 関連ラボ

| ラボ | 関連性 |
|------|--------|
| [セッション固定](../step04-session/session-fixation.md) | JWT とセッション Cookie は認証の仕組みが異なるが、どちらもトークンの信頼性に関する脆弱性。セッション方式の違いによる攻撃手法の違いを比較できる |
| [権限昇格](../step05-access-control/privilege-escalation.md) | JWT 改ざんは権限昇格の一手法。IDOR やロールチェックの不備と組み合わせて影響を拡大できる |
| [弱いパスワードポリシー](../step03-auth/weak-password-policy.md) | JWT の弱い秘密鍵と弱いパスワードは「推測可能な秘密」という共通の問題パターン |

---

## 参考資料

- [OWASP - JWT Attacks](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/10-Testing_JSON_Web_Tokens)
- [CWE-347: Improper Verification of Cryptographic Signature](https://cwe.mitre.org/data/definitions/347.html)
- [CWE-327: Use of a Broken or Risky Cryptographic Algorithm](https://cwe.mitre.org/data/definitions/327.html)
