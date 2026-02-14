# CLAUDE.md - sec-web-lab 開発ガイド

## プロジェクト概要

Webセキュリティの脆弱性を実際に体験して学ぶためのハンズオンラボ環境。
意図的に脆弱なWebアプリを構築し、攻撃と防御の両方を体験する。

**重要**: このリポジトリのコードは学習目的で意図的に脆弱性を含んでいます。

## 技術スタック

- **バックエンド**: Hono (Node.js) — `backend/`
- **フロントエンド**: Vite + React + TypeScript — `frontend/`
- **データベース**: PostgreSQL 16
- **パッケージマネージャー**: pnpm
- **開発環境**: Dev Containers (Docker Compose)

## ディレクトリ構成

```
backend/src/           → Hono API サーバー
  index.ts             → エントリポイント・ルート登録
  db/pool.ts           → PostgreSQL 接続プール
  db/seed.ts           → テストデータ投入
frontend/src/          → React アプリ
  App.tsx              → ルーティング設定
  pages/               → 各ラボのページコンポーネント
docker/db/init.sql     → DB スキーマ・初期データ
labs/                  → 各ラボの解説ドキュメント
```

## コマンド

```bash
# バックエンド
cd backend
pnpm install         # 依存インストール
pnpm dev             # 開発サーバー起動 (port 3000)
pnpm typecheck       # 型チェック
pnpm db:seed         # テストデータ投入

# フロントエンド
cd frontend
pnpm install         # 依存インストール
pnpm dev             # 開発サーバー起動 (port 5173)
pnpm build           # プロダクションビルド
pnpm typecheck       # 型チェック
```

## 開発ルール

### ラボの追加手順

1. **バックエンド**: `backend/src/labs/<lab-name>.ts` に脆弱なルートを作成
   - Hono の `Hono` インスタンスを export する
   - `backend/src/index.ts` で `app.route()` を使って登録
2. **フロントエンド**: `frontend/src/pages/<LabName>.tsx` にページを作成
   - `frontend/src/App.tsx` にルートを追加
3. **ドキュメント**: `labs/<lab-name>.md` に解説を作成

### 脆弱なコードと安全なコードの管理

各ラボでは以下の2つのバージョンを用意する:

- **脆弱バージョン** (`/api/labs/<name>/vulnerable/...`): 攻撃が成功するエンドポイント
- **安全バージョン** (`/api/labs/<name>/secure/...`): 修正済みエンドポイント

### コーディング規約

- TypeScript strict mode を使用
- バックエンドは ESM (`"type": "module"`)
- インポートパスには `.js` 拡張子を付ける (ESM の規約)
- 日本語コメントを推奨 (学習者向け)

### DB操作

- スキーマ変更は `docker/db/init.sql` に追加
- テストデータは `backend/src/db/seed.ts` に追加
- 接続は `backend/src/db/pool.ts` の `getPool()` を使用

### セキュリティ図の生成

攻撃フローや対策の説明図を作成する場合は、`security-svg-diagram` スキルを使用すること。
このスキルは以下のような図を自動生成する:

- 攻撃の流れを示す**攻撃図**と、防御方法を示す**対策図**の2枚1組のSVG
- XSS、CSRF、SQLインジェクション、MITM、フィッシングなど各種攻撃タイプに対応
- 攻撃者・サーバー・被害者のアクター配置と番号付きステップによるフロー可視化

### 注意事項

- このプロジェクトのコードは**学習目的で意図的に脆弱**です
- 脆弱なコードを書く際は、何が脆弱なのかコメントで明記すること
- 安全なバージョンでは、なぜ安全なのかコメントで説明すること
- 本番環境には絶対にデプロイしないこと
