# Security Header Misconfiguration — セキュリティヘッダーの欠如による脆弱性

> ブラウザが持つセキュリティ機能を有効にするためのHTTPレスポンスヘッダー（`X-Content-Type-Options` 等）が設定されておらず、XSSやクリックジャッキングなどの攻撃に対する防御層が欠けている問題です。

---

## 対象ラボ

| 項目 | 内容 |
|------|------|
| **概要** | `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy` 等のセキュリティヘッダーが設定されておらず、ブラウザの保護機能が無効のまま |
| **攻撃例** | セキュリティヘッダーが欠如しているレスポンスを確認し、MIMEスニッフィングやクリックジャッキングの攻撃経路を特定する |
| **技術スタック** | Hono API |
| **難易度** | ★☆☆ 入門 |
| **前提知識** | HTTPレスポンスヘッダーの基本（[HTTPヘッダーからの情報漏洩](header-leakage.md) を先に学ぶことを推奨） |

---

## この脆弱性を理解するための前提

### セキュリティヘッダーの役割

ブラウザは「サーバーから指示がなければ、歴史的な互換性を優先する」という設計になっている。例えば、`Content-Type` が正しく設定されていなくても、ブラウザは中身を推測して実行しようとする（MIMEスニッフィング）。これは便利だが、攻撃に悪用される可能性がある。

セキュリティヘッダーは、サーバーからブラウザに対して「この挙動を制限してください」と指示するもの。

```
HTTP/1.1 200 OK
Content-Type: text/html
X-Content-Type-Options: nosniff      ← MIMEスニッフィングを禁止
X-Frame-Options: DENY                ← iframe埋め込みを禁止
Content-Security-Policy: default-src 'self'  ← リソース読み込み元を制限
Strict-Transport-Security: max-age=31536000  ← HTTPS強制
```

これらのヘッダーが存在することで、ブラウザは追加のセキュリティ機能を有効にする。

### どこに脆弱性が生まれるのか

セキュリティヘッダーは**サーバーが明示的に設定しなければ付与されない**。多くのフレームワークはデフォルトでこれらのヘッダーを付与しないため、開発者が意識して設定しない限り、ブラウザの保護機能は無効のままになる。

```typescript
// ⚠️ セキュリティヘッダーが一切設定されていない
// ブラウザの保護機能が有効にならず、様々な攻撃に対して無防備

app.get("/", (c) => {
  return c.html("<html>...</html>");
  // レスポンスヘッダー:
  // Content-Type: text/html
  // ← X-Content-Type-Options がない → MIMEスニッフィング可能
  // ← X-Frame-Options がない → iframe埋め込み（クリックジャッキング）可能
  // ← CSP がない → 外部スクリプトの注入が容易
});
```

---

## 攻撃の仕組み

![攻撃フロー](diagrams/header-leakage-attack.svg)

### 攻撃のシナリオ

1. **攻撃者** がターゲットのレスポンスヘッダーを確認する

   `curl -I` やブラウザの DevTools でセキュリティヘッダーの有無をチェックする。

   ```bash
   $ curl -I http://target:3000/
   HTTP/1.1 200 OK
   Content-Type: text/html
   # ← セキュリティヘッダーが一切ない
   ```

2. **攻撃者** が欠如しているヘッダーに対応する攻撃手法を特定する

   - `X-Content-Type-Options` がない → MIMEスニッフィングを利用した攻撃が可能
   - `X-Frame-Options` がない → クリックジャッキングが可能
   - `Content-Security-Policy` がない → XSS攻撃の成功率が向上

3. **攻撃者** が特定した攻撃経路を利用して攻撃を実行する

   例えば `X-Frame-Options` がないことを確認した攻撃者は、ターゲットサイトを `iframe` に埋め込んだ罠ページを作成し、クリックジャッキング攻撃を仕掛ける。

   ```html
   <!-- 攻撃者が作成する罠ページ -->
   <iframe src="http://target:3000/transfer" style="opacity: 0">
   </iframe>
   <button style="position: absolute; top: 200px; left: 100px;">
     景品を受け取る
   </button>
   <!-- ユーザーは「景品を受け取る」をクリックするが、
        実際には透明なiframe内の「送金」ボタンをクリックしている -->
   ```

### なぜ成功するのか

| 条件 | 説明 |
|------|------|
| セキュリティヘッダーの未設定 | サーバーがブラウザの保護機能を有効にするヘッダーを返していない |
| ブラウザのデフォルト動作 | セキュリティヘッダーがなければ、ブラウザは互換性を優先し保護機能を無効にする |
| 偵察の容易さ | セキュリティヘッダーの有無は `curl -I` 一発で確認でき、攻撃計画が立てやすい |

### 被害の範囲

- **機密性**: セキュリティヘッダー欠如自体で情報は漏洩しないが、XSSやクリックジャッキングの成功率が上がり、間接的に情報漏洩につながる
- **完全性**: クリックジャッキングにより、ユーザーが意図しない操作（送金、設定変更等）を実行させられる
- **可用性**: 直接的な影響は小さいが、MIMEスニッフィング経由でのマルウェア実行等のリスクがある

---

## 対策

![対策フロー](diagrams/header-leakage-defense.svg)

### 根本原因

サーバーがブラウザのセキュリティ機能を有効にするための指示（ヘッダー）を送っていないこと。ブラウザは「明示的な指示がなければ保護しない」設計であるため、サーバー側から積極的にヘッダーを付与する必要がある。

### 安全な実装

ミドルウェアで全レスポンスにセキュリティヘッダーを付与する。

```typescript
// ✅ セキュリティヘッダーをミドルウェアで一括付与する
// 個別のルートごとに設定するのではなく、全レスポンスに適用する

app.use("*", async (c, next) => {
  await next();

  // MIMEスニッフィングの防止
  c.res.headers.set("X-Content-Type-Options", "nosniff");

  // iframe埋め込みの防止（クリックジャッキング対策）
  c.res.headers.set("X-Frame-Options", "DENY");

  // XSSフィルターの有効化（レガシーブラウザ向け）
  c.res.headers.set("X-XSS-Protection", "1; mode=block");

  // リソース読み込み元の制限（XSS対策の追加防御層）
  c.res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'"
  );
});
```

**なぜ安全か**: 各セキュリティヘッダーがブラウザの特定の保護機能を有効にする。`X-Content-Type-Options: nosniff` はMIMEスニッフィングを禁止し、`X-Frame-Options: DENY` はiframe埋め込みを禁止する。これらの設定により、ブラウザが「安全側に倒す」動作をするようになる。

#### 脆弱 vs 安全: コード比較

```diff
  app.use("*", async (c, next) => {
    await next();
-   // セキュリティヘッダーなし — ブラウザの保護機能が無効
+   c.res.headers.set("X-Content-Type-Options", "nosniff");
+   c.res.headers.set("X-Frame-Options", "DENY");
+   c.res.headers.set("X-XSS-Protection", "1; mode=block");
+   c.res.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'");
  });
```

脆弱版ではセキュリティヘッダーが一切設定されていない。安全版では4つのセキュリティヘッダーを付与し、ブラウザの保護機能を有効化している。

### その他の防御策

| 対策 | 種類 | 説明 |
|------|------|------|
| セキュリティヘッダーの付与 | 根本対策 | `X-Content-Type-Options`, `X-Frame-Options`, `CSP` 等を全レスポンスに設定する |
| Helmet等のライブラリ使用 | 根本対策 | セキュリティヘッダーを一括設定するライブラリを使い、設定漏れを防ぐ |
| リバースプロキシでのヘッダー付与 | 多層防御 | Nginx / Cloudflare レベルでもセキュリティヘッダーを付与し、アプリが設定を忘れても保護される |
| セキュリティヘッダー監査 | 検知 | securityheaders.com 等で定期的にヘッダーをチェックする |

---

## ハンズオン手順

### Step 1: 脆弱バージョンで攻撃を体験

**ゴール**: セキュリティヘッダーが欠如していることを確認し、それがどんな攻撃を可能にするか理解する

1. 開発サーバーを起動する

2. 脆弱なエンドポイントのレスポンスヘッダーを確認する

   ```bash
   # レスポンスヘッダーを確認
   curl -I http://localhost:3000/api/labs/header-exposure/vulnerable/
   ```

3. セキュリティヘッダーの有無をチェックする

   - `X-Content-Type-Options` が存在するか
   - `X-Frame-Options` が存在するか
   - `Content-Security-Policy` が存在するか
   - **この結果が意味すること**: これらのヘッダーが欠如していると、ブラウザのセキュリティ機能が無効のままになり、XSSやクリックジャッキングの防御層が失われる

### Step 2: 安全バージョンで防御を確認

**ゴール**: セキュリティヘッダーが適切に設定されていることを確認する

1. 安全なエンドポイントのレスポンスヘッダーを確認する

   ```bash
   # 同じリクエストを安全なバージョンに対して実行
   curl -I http://localhost:3000/api/labs/header-exposure/secure/
   ```

2. セキュリティヘッダーが追加されていることを確認する

   - 脆弱版と安全版でレスポンスヘッダーを並べて比較する
   - 各ヘッダーがどんな攻撃を防ぐのか確認する

3. コードの差分を確認する

   - `backend/src/labs/header-exposure.ts` の脆弱版と安全版を比較
   - **どの行が違いを生んでいるか** に注目

### 確認ポイント

以下を自分の言葉で説明できれば、このラボは完了です:

- [ ] セキュリティヘッダーがないと「なぜ」ブラウザの保護機能が働かないのか
- [ ] `X-Content-Type-Options: nosniff` は具体的にどんな攻撃を防ぐか
- [ ] `X-Frame-Options: DENY` はクリックジャッキングをどう防ぐか
- [ ] セキュリティヘッダーは「多層防御」の一部であり、これだけで完全に安全にはならない理由

---

## 実装メモ

| 項目 | パス |
|------|------|
| 脆弱エンドポイント | `/api/labs/header-exposure/vulnerable/` |
| 安全エンドポイント | `/api/labs/header-exposure/secure/` |
| バックエンド | `backend/src/labs/header-exposure.ts` |
| フロントエンド | `frontend/src/pages/HeaderExposure.tsx` |

- 脆弱版: セキュリティヘッダーなしでレスポンスを返す
- 安全版: セキュリティヘッダーを付与してレスポンスを返す
- DevTools の Network タブでも確認可能（ブラウザでの体験も推奨）
- [HTTPヘッダーからの情報漏洩](header-leakage.md) と共通の図を参照

---

## 関連ラボ

| ラボ | 関連性 |
|------|--------|
| [HTTPヘッダーからの情報漏洩](header-leakage.md) | 不要なヘッダーの「除去」と、セキュリティヘッダーの「付与」はセットで行う。両方合わせてヘッダーの安全な管理になる |
| [クリックジャッキング](../step07-design/clickjacking.md) | `X-Frame-Options` の欠如を直接悪用する攻撃。本ラボで学んだ防御策が直接役立つ |

---

## 参考資料

- [OWASP - HTTP Headers](https://owasp.org/www-project-secure-headers/)
- [CWE-693: Protection Mechanism Failure](https://cwe.mitre.org/data/definitions/693.html)
