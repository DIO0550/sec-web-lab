# Sensitive File Exposure — 機密ファイルの露出 (.git / .env / robots.txt)

> `.env` や `.git/` などの機密ファイルがWebから直接アクセスでき、データベースのパスワードやソースコードが丸ごと盗まれてしまう問題です。

---

## 対象ラボ

| 項目 | 内容 |
|------|------|
| **概要** | `.env`, `.git/`, `robots.txt` 等の機密ファイルがWebサーバーから直接ダウンロード可能になっている |
| **攻撃例** | `http://localhost:3000/.env` でDB接続情報・APIキーを取得、`http://localhost:3000/.git/HEAD` でGit履歴からソースコードを復元 |
| **技術スタック** | Hono API (静的ファイル配信) |
| **難易度** | ★☆☆ 入門 |
| **前提知識** | HTTPリクエストの基本、`.env` ファイルの役割、Git の基本概念 |

---

## この脆弱性を理解するための前提

### 静的ファイル配信の仕組み

Webサーバーは、指定されたディレクトリ内のファイルをHTTPリクエストのパスに応じて返却する。例えば、公開ディレクトリが `/public` に設定されている場合、`/style.css` へのリクエストは `/public/style.css` を返す。

```
GET /style.css  →  /public/style.css を返却
GET /logo.png   →  /public/logo.png を返却
```

この仕組み自体は正常だが、問題は**どのファイルを返すか**のフィルタリングにある。

### どこに脆弱性が生まれるのか

プロジェクトのルートディレクトリには、開発に必要だが外部に公開すべきでないファイルが多数存在する。静的ファイル配信の設定で**ドットファイル（`.`で始まるファイルやディレクトリ）を除外しない**と、これらが誰でもダウンロード可能になる。

```typescript
// ⚠️ 公開ディレクトリをプロジェクトルートに設定し、
//    ドットファイルのフィルタリングを行っていない
// これにより .env, .git/ 等の機密ファイルが全て公開される

import { serveStatic } from "hono/serve-static";

app.use("/*", serveStatic({ root: "./" }));
// /.env         → DB_PASSWORD=secret123 が丸見え
// /.git/HEAD    → Git履歴にアクセス可能
// /robots.txt   → 管理画面のパスが記載されている可能性
```

---

## 攻撃の仕組み

![攻撃フロー](diagrams/sensitive-file-exposure-attack.svg)

### 攻撃のシナリオ

1. **攻撃者** が `/.env` に直接アクセスする

   `.env` ファイルは環境変数を格納する一般的なファイルで、ほぼすべてのWebアプリケーションで使われている。攻撃者はまずこの既知のパスを試す。

   ```bash
   $ curl http://target:3000/.env
   ```

2. **Webサーバー** がドットファイルをフィルタリングせず `.env` の内容を返す

   サーバーは静的ファイルとして `.env` を認識し、その中身をそのまま返却する。

   ```
   DB_HOST=db.internal.example.com
   DB_PASSWORD=secret123
   API_KEY=sk-live-abcdef1234567890
   JWT_SECRET=my-super-secret-key
   ```

3. **攻撃者** が `/.git/HEAD` にアクセスし、Git履歴の存在を確認する

   `.git/` ディレクトリが公開されていれば、オブジェクトファイルを辿ってソースコード全体を復元できる。`git-dumper` 等のツールを使えば自動化も可能。

   ```bash
   $ curl http://target:3000/.git/HEAD
   ref: refs/heads/main
   ```

4. **攻撃者** が窃取した情報を整理する

   `.env` からDB接続情報とAPIキーを取得し、`.git/` からソースコードを復元して内部ロジックを把握する。`robots.txt` に記載された `Disallow: /admin/` から管理画面の存在も判明する。

5. **攻撃者** が窃取した認証情報で不正アクセスを実行する

   DB接続情報を使ってデータベースに直接接続したり、APIキーを使って外部サービスを不正利用したりする。ソースコードの解析で見つけた別の脆弱性も併用する。

### なぜ成功するのか

| 条件 | 説明 |
|------|------|
| ドットファイルのフィルタリング欠如 | 静的ファイル配信でドットファイルへのアクセスを制限していない |
| 機密ファイルのデプロイ | `.env`, `.git/` 等がデプロイ成果物に含まれている |
| 既知のパス | `.env`, `.git/`, `robots.txt` は全てのWebアプリで共通の既知パスであり、攻撃者は最初にこれらを試す |

### 被害の範囲

- **機密性**: DB接続情報、APIキー、JWT秘密鍵、ソースコード全体が漏洩する
- **完全性**: 窃取した認証情報を使い、データベースの内容を任意に改ざんされる可能性がある
- **可用性**: DB接続情報を使ったデータ削除やサービス妨害が可能になる

---

## 対策

![対策フロー](diagrams/sensitive-file-exposure-defense.svg)

### 根本原因

「外部に公開すべきでないファイル」が公開ディレクトリに含まれていること。静的ファイル配信は「指定されたディレクトリ内のファイルを無条件に返す」仕組みであり、**公開してよいファイルだけを配信対象にする**設計が必要。

### 安全な実装

ドットファイルへのアクセスをミドルウェアで拒否する。リクエストパスに `/.` が含まれていたら 403 Forbidden を返す。

```typescript
// ✅ ドットファイルへのアクセスをミドルウェアで一律拒否する
// リクエストパスに "/." が含まれていれば、ファイルの存在を確認する前に拒否する
// これにより .env, .git/, .htaccess 等すべてのドットファイルが保護される

app.use("*", async (c, next) => {
  const path = new URL(c.req.url).pathname;
  if (/\/\./.test(path)) {
    return c.text("Forbidden", 403);
  }
  await next();
});
```

**なぜ安全か**: リクエストパスの段階でドットファイルへのアクセスを遮断するため、ファイルシステムに到達する前にリクエストが拒否される。`.env`, `.git/`, `.htaccess` など、ドットで始まるすべてのファイル・ディレクトリが一律に保護される。

#### 脆弱 vs 安全: コード比較

```diff
- app.use("/*", serveStatic({ root: "./" }));
- // すべてのファイルが無条件に返される（.env, .git/ 含む）
+ app.use("*", async (c, next) => {
+   const path = new URL(c.req.url).pathname;
+   if (/\/\./.test(path)) {
+     return c.text("Forbidden", 403);
+   }
+   await next();
+ });
+ app.use("/*", serveStatic({ root: "./public" }));
+ // ドットファイルは拒否 + 公開ディレクトリを限定
```

脆弱版ではプロジェクトルートを丸ごと公開している。安全版ではドットファイルを拒否し、公開ディレクトリを `./public` に限定している。

### その他の防御策

| 対策 | 種類 | 説明 |
|------|------|------|
| パスフィルター（ミドルウェア） | 根本対策 | ドットファイルへのアクセスをアプリケーション層で拒否する |
| デプロイ時の除外 | 根本対策 | `.dockerignore` で `.env`, `.git/` を本番環境に含めない。ファイル自体が存在しなければ漏洩しない |
| Nginx deny ルール | 多層防御 | Webサーバーレベルで `location ~ /\. { deny all; }` を設定し、二重にブロックする |
| Secrets Manager | 多層防御 | `.env` ファイル自体を使わず、Docker secrets / AWS SSM / Vault 等で秘密情報を管理する |

---

## ハンズオン手順

### Step 1: 脆弱バージョンで攻撃を体験

**ゴール**: 機密ファイルの内容がWebから直接取得できることを確認する

1. 開発サーバーを起動する

2. 機密ファイルへの直接アクセスを試みる

   ```bash
   # .env ファイルへのアクセス
   curl http://localhost:3000/api/labs/sensitive-file-exposure/vulnerable/.env

   # .git/HEAD へのアクセス
   curl http://localhost:3000/api/labs/sensitive-file-exposure/vulnerable/.git/HEAD

   # robots.txt へのアクセス
   curl http://localhost:3000/api/labs/sensitive-file-exposure/vulnerable/robots.txt
   ```

3. 返却された内容を確認する

   - `.env` にDB接続情報やAPIキーが含まれているか
   - `.git/HEAD` からリポジトリの存在が確認できるか
   - `robots.txt` に管理画面等の隠しパスが記載されていないか
   - **この結果が意味すること**: 攻撃者はブラウザだけでDB認証情報を取得し、ソースコードを復元できる

### Step 2: 安全バージョンで防御を確認

**ゴール**: 同じアクセスが 403 Forbidden で拒否されることを確認する

1. 安全なエンドポイントに同じリクエストを送る

   ```bash
   # 同じアクセスを安全なバージョンに対して実行
   curl http://localhost:3000/api/labs/sensitive-file-exposure/secure/.env
   curl http://localhost:3000/api/labs/sensitive-file-exposure/secure/.git/HEAD
   ```

2. レスポンスが 403 Forbidden であることを確認する

3. コードの差分を確認する

   - `backend/src/labs/sensitive-file-exposure.ts` の脆弱版と安全版を比較
   - **どの行が違いを生んでいるか** に注目（パスフィルタリングのミドルウェア）

### 確認ポイント

以下を自分の言葉で説明できれば、このラボは完了です:

- [ ] `.env` や `.git/` が公開される条件は何か（静的ファイル配信の設定ミス）
- [ ] 攻撃者は何にアクセスし、取得した情報をどう悪用するか
- [ ] パスフィルタリングがなぜ効果的か（ファイルシステムへの到達前に遮断）
- [ ] デプロイ時の除外と Secrets Manager がなぜ「多層防御」として重要か

---

## 実装メモ

| 項目 | パス |
|------|------|
| 脆弱エンドポイント | `/api/labs/sensitive-file-exposure/vulnerable/` |
| 安全エンドポイント | `/api/labs/sensitive-file-exposure/secure/` |
| バックエンド | `backend/src/labs/sensitive-file-exposure.ts` |
| フロントエンド | `frontend/src/pages/SensitiveFileExposure.tsx` |

- 脆弱版: 静的ファイル配信でドットファイルも含めて返却する
- 安全版: ドットファイルへのリクエストを 403 で拒否し、公開ディレクトリを限定する
- テスト用の `.env` と `.git/HEAD` のダミーファイルを配置する

---

## 現実世界での事例

| 年 | インシデント | 概要 |
|----|-------------|------|
| 2019 | Capital One 情報漏洩 | 設定ファイルの露出を起点として、約1億人の個人情報が漏洩した |
| 継続的 | `.git` 公開によるソースコード漏洩 | `.git/` ディレクトリの公開は非常に一般的なミスであり、自動スキャンツールが存在する。ソースコード復元により内部APIキーや脆弱なロジックが発見される |

---

## 関連ラボ

| ラボ | 関連性 |
|------|--------|
| [ディレクトリリスティング](directory-listing.md) | ディレクトリ一覧が公開されると、機密ファイルの存在を確認しやすくなる |
| [HTTPヘッダーからの情報漏洩](header-leakage.md) | ヘッダー漏洩と機密ファイル露出を組み合わせると、偵察フェーズの効率が飛躍的に向上する |

---

## 参考資料

- [OWASP - Information Disclosure](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/)
- [CWE-538: Insertion of Sensitive Information into Externally-Accessible File or Directory](https://cwe.mitre.org/data/definitions/538.html)
