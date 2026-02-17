# Fail-Open — エラー時にアクセスを許可してしまう設計ミス

> 認証・認可の処理で例外が発生した際に、デフォルトでアクセスを許可（Fail-Open）してしまうことで、攻撃者が認証をバイパスできてしまう脆弱性を学びます。

---

## 対象ラボ

### 1. 例外発生時のセキュリティバイパス

| 項目 | 内容 |
|------|------|
| **概要** | 認証・認可の例外発生時に、デフォルトでアクセスを許可してしまう |
| **攻撃例** | 認証サーバーに接続できない場合にログインをスキップ |
| **技術スタック** | Hono API ミドルウェア |
| **難易度** | ★★☆ 中級 |
| **前提知識** | HTTP ミドルウェアの仕組み、try-catch によるエラーハンドリング |

---

## この脆弱性を理解するための前提

### ミドルウェアによる認証の仕組み

Web アプリケーションでは、リクエスト処理の前段階でミドルウェアが認証チェックを行うのが一般的:

1. リクエストが到着する
2. 認証ミドルウェアがセッションやトークンを検証する
3. 検証成功なら次の処理へ進む（`next()`）
4. 検証失敗なら 401 Unauthorized を返す

```typescript
// 一般的な認証ミドルウェアの構造
app.use('/api/admin/*', async (c, next) => {
  const token = c.req.header('Authorization');
  const user = await verifyToken(token);
  if (!user) {
    return c.json({ error: '未認証' }, 401);
  }
  c.set('user', user);
  await next();
});
```

### どこに脆弱性が生まれるのか

問題は、認証チェックの途中で **例外が発生した場合の処理** にある。例外を catch した際に「安全側に倒す（Fail-Close）」のではなく、「アクセスを許可する（Fail-Open）」設計になっていると、攻撃者はエラーを意図的に発生させることで認証をバイパスできる。

```typescript
// ⚠️ この部分が問題 — 例外発生時にアクセスを許可してしまう
app.use('/api/admin/*', async (c, next) => {
  try {
    const token = c.req.header('Authorization');
    const user = await verifyToken(token); // ← DBやAuthサービスへの接続失敗で例外
    if (!user) {
      return c.json({ error: '未認証' }, 401);
    }
    c.set('user', user);
  } catch (error) {
    // エラー時にそのまま通過させてしまう（Fail-Open）
    console.error('認証エラー:', error);
  }
  await next(); // ← 例外が発生してもここに到達し、リクエストが処理される
});
```

認証サービスへの接続が失敗したり、トークンの検証でパースエラーが発生した場合、catch ブロックに入った後 `next()` が呼ばれ、未認証のままリクエストが通過する。

---

## 攻撃の仕組み

![攻撃フロー](diagrams/fail-open-attack.svg)

### 攻撃のシナリオ

1. **攻撃者** が認証エラーを引き起こすリクエストを送信する

   不正な形式のトークンや、認証サービスに負荷をかけるリクエストを送信し、認証ミドルウェアで例外を発生させる。

   ```bash
   # 不正なトークン形式で認証エラーを誘発
   curl -X GET http://localhost:3000/api/labs/fail-open/vulnerable/admin/dashboard \
     -H "Authorization: Bearer INVALID.TOKEN.FORMAT"
   ```

2. **サーバー** の認証ミドルウェアで例外が発生する

   `verifyToken()` がトークンのパースに失敗し、例外をスローする。catch ブロックではログ出力のみ行い、エラーレスポンスを返さない。

3. **サーバー** が `next()` を呼び出し、リクエストを通過させる

   catch ブロックの後に `await next()` があるため、例外の有無に関係なく次のハンドラーに処理が進む。認証されていないリクエストが管理者用エンドポイントに到達する。

4. **攻撃者** が認証なしで管理者リソースにアクセスする

   管理者ダッシュボードや機密データに未認証でアクセスでき、ユーザー情報の閲覧・変更・削除が可能になる。

### なぜ成功するのか

| 条件 | 説明 |
|------|------|
| Fail-Open 設計 | 例外発生時にデフォルトでアクセスを許可する設計。「安全側に倒す」原則に反している |
| catch 後の `next()` | try-catch の後に `next()` が配置されているため、例外が発生しても処理が続行される |
| エラー時の明示的拒否がない | catch ブロック内で `return c.json({ error: ... }, 500)` のような明示的な拒否レスポンスを返していない |

### 被害の範囲

- **機密性**: 管理者用のダッシュボードや全ユーザーデータに不正アクセスが可能
- **完全性**: 認証バイパスにより、他ユーザーのデータ変更・削除が可能になる
- **可用性**: 管理者権限の乗っ取りにより、サービス全体の停止・改ざんが可能

---

## 対策

![対策フロー](diagrams/fail-open-defense.svg)

### 根本原因

認証処理の例外発生時に **アクセスを拒否する（Fail-Close）** 設計になっていないことが根本原因。セキュリティに関わる処理では、エラーや不確実な状態が発生した場合は常にアクセスを拒否すべきである。

### 安全な実装

Fail-Close パターンでは、認証チェックが成功した場合 **のみ** `next()` を呼び出す。例外が発生した場合は明示的にエラーレスポンスを返して処理を中断する。

```typescript
// ✅ Fail-Close — 認証成功時のみアクセスを許可
app.use('/api/admin/*', async (c, next) => {
  try {
    const token = c.req.header('Authorization');
    if (!token) {
      return c.json({ error: '認証トークンが必要です' }, 401);
    }
    const user = await verifyToken(token);
    if (!user) {
      return c.json({ error: '無効なトークンです' }, 401);
    }
    c.set('user', user);
    await next(); // ← 認証成功時のみここに到達
  } catch (error) {
    console.error('認証エラー:', error);
    // 例外時は明示的にアクセスを拒否
    return c.json({ error: '認証処理でエラーが発生しました' }, 500);
  }
});
```

#### 脆弱 vs 安全: コード比較

```diff
  app.use('/api/admin/*', async (c, next) => {
    try {
      const token = c.req.header('Authorization');
+     if (!token) {
+       return c.json({ error: '認証トークンが必要です' }, 401);
+     }
      const user = await verifyToken(token);
      if (!user) {
        return c.json({ error: '未認証' }, 401);
      }
      c.set('user', user);
+     await next(); // ← try ブロック内に移動
    } catch (error) {
      console.error('認証エラー:', error);
+     return c.json({ error: '認証処理でエラーが発生しました' }, 500);
    }
-   await next(); // ← 例外時もここに到達してしまう
  });
```

脆弱なコードでは `next()` が try-catch の外にあるため、例外時も処理が続行される。安全なコードでは `next()` を try ブロック内の認証成功後に移動し、catch では明示的に 500 エラーを返す。

### その他の防御策

| 対策 | 種類 | 説明 |
|------|------|------|
| Fail-Close 設計 | 根本対策 | エラー発生時はデフォルトでアクセスを拒否する。`next()` は認証成功の条件分岐内にのみ配置 |
| 認証サービスのヘルスチェック | 多層防御 | 認証サービスの死活監視を行い、障害時にはサービス全体をメンテナンスモードにする |
| サーキットブレーカー | 多層防御 | 認証サービスへの接続失敗が続く場合、自動的に全リクエストを拒否するパターン |
| 認証ログの監視 | 検知 | 認証エラーの急増を監視し、異常を検知した場合にアラートを発報する |
| テストでの検証 | 予防 | 認証ミドルウェアのユニットテストで、例外発生時にアクセスが拒否されることを検証する |

---

## ハンズオン手順

### Step 1: 脆弱バージョンで攻撃を体験

**ゴール**: 認証エラーを誘発することで、未認証のまま管理者リソースにアクセスできることを確認する

1. 開発サーバーを起動する

   ```bash
   cd backend && pnpm dev
   ```

2. 不正なトークンで管理者エンドポイントにアクセスする

   ```bash
   # 不正なトークン形式で認証エラーを誘発
   curl http://localhost:3000/api/labs/fail-open/vulnerable/admin/dashboard \
     -H "Authorization: Bearer INVALID.TOKEN"
   ```

3. 結果を確認する

   - 管理者ダッシュボードのデータが返される（200 OK）
   - 認証が成功していないにもかかわらずアクセスが許可されている
   - **この結果が意味すること**: 認証ミドルウェアの例外が握りつぶされ、Fail-Open でリクエストが通過した

4. トークンなしでも試す

   ```bash
   curl http://localhost:3000/api/labs/fail-open/vulnerable/admin/dashboard
   ```

### Step 2: 安全バージョンで防御を確認

**ゴール**: 同じリクエストが Fail-Close により拒否されることを確認する

1. 安全なエンドポイントに同じリクエストを送信する

   ```bash
   curl http://localhost:3000/api/labs/fail-open/secure/admin/dashboard \
     -H "Authorization: Bearer INVALID.TOKEN"
   ```

2. 結果を確認する

   - `500 Internal Server Error` が返され、アクセスが拒否される
   - 認証処理の例外時に明示的にエラーレスポンスが返されている

3. 正規のトークンでアクセスできることを確認する

   - 正しいトークンの場合のみ管理者ダッシュボードにアクセスできる

4. コードの差分を確認する

   - `backend/src/labs/step09-defense/fail-open.ts` の脆弱版と安全版を比較
   - **どの行が違いを生んでいるか** に注目: `next()` の位置と catch ブロックの処理

### 確認ポイント

以下を自分の言葉で説明できれば、このラボは完了です:

- [ ] Fail-Open と Fail-Close の違いは何か
- [ ] `next()` の配置位置がセキュリティにどう影響するか
- [ ] 認証サービスの障害時にアプリケーションはどう振る舞うべきか
- [ ] catch ブロックで明示的にエラーを返すことがなぜ重要か

---

## 実装メモ

| 項目 | パス |
|------|------|
| 脆弱エンドポイント | `/api/labs/fail-open/vulnerable/admin/dashboard` |
| 安全エンドポイント | `/api/labs/fail-open/secure/admin/dashboard` |
| バックエンド | `backend/src/labs/step09-defense/fail-open.ts` |
| フロントエンド | `frontend/src/labs/step09-defense/pages/FailOpen.tsx` |

- 脆弱版では `next()` が try-catch の外に配置され、例外時も通過する
- 安全版では `next()` を try ブロック内に移動し、catch で明示的にエラーを返す
- 認証サービスの障害をシミュレートするため、特定のトークン値で例外を発生させる仕組みを用意

---

## 現実世界での事例

| 年 | インシデント | 概要 |
|----|-------------|------|
| 2014 | Apple goto fail | SSL/TLS の証明書検証コードでバグにより検証がスキップされ、中間者攻撃が可能に。Fail-Open の典型例 |
| 2018 | GitHub OAuth | 認証フローの例外処理が不適切で、特定の条件下でOAuth トークンの検証がバイパスされた |
| 2020 | SolarWinds | 認証メカニズムの欠陥により、特定のAPI呼び出しで認証チェックが迂回可能だった |

---

## 関連ラボ

| ラボ | 関連性 |
|------|--------|
| [詳細エラーメッセージ露出](./error-messages.md) | Fail-Open で通過したリクエストが詳細エラーを受け取ることで、さらなる攻撃の足がかりとなる |
| [ブルートフォース](../step03-auth/brute-force.md) | 認証の例外処理とレート制限の両方が必要。Fail-Open はブルートフォースをより容易にする |
| [権限昇格](../step05-access-control/privilege-escalation.md) | Fail-Open による認証バイパスは、実質的に権限昇格と同じ被害をもたらす |

---

## 参考資料

- [OWASP - Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
- [CWE-636: Not Failing Securely (Failing Open)](https://cwe.mitre.org/data/definitions/636.html)
