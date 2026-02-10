# sec-web-lab

Web セキュリティの脆弱性を**実際に手を動かして学ぶ**ためのラボ環境です。
意図的に脆弱なWebアプリケーションをDockerで立ち上げ、攻撃と防御を体験します。

> **警告**: このリポジトリに含まれるコードには意図的な脆弱性があります。
> 学習・研究目的でのみ使用してください。本番環境には絶対にデプロイしないでください。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Vite + React + TypeScript |
| バックエンド | Hono (Node.js) |
| データベース | PostgreSQL 16 |
| 開発環境 | Dev Containers (Docker Compose) |

## セットアップ

### 前提条件

- Docker Desktop
- VS Code + [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### 起動方法

1. リポジトリをクローン
   ```bash
   git clone https://github.com/DIO0550/sec-web-lab.git
   cd sec-web-lab
   ```

2. VS Code でフォルダを開き、「Reopen in Container」を実行
   - コマンドパレット → `Dev Containers: Reopen in Container`

3. コンテナ内でサーバーを起動
   ```bash
   # バックエンド (port 3000)
   cd backend && npm run dev

   # フロントエンド (port 5173) — 別ターミナルで
   cd frontend && npm run dev
   ```

4. ブラウザで http://localhost:5173 にアクセス

### devcontainer を使わない場合

```bash
# PostgreSQL が localhost:5432 で動いている前提
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## プロジェクト構成

```
sec-web-lab/
├── .devcontainer/       # Dev Container 設定
│   ├── devcontainer.json
│   ├── docker-compose.yml
│   └── Dockerfile
├── backend/             # Hono API サーバー (意図的に脆弱)
│   └── src/
│       ├── index.ts     # エントリポイント
│       └── db/          # DB 接続・シード
├── frontend/            # Vite + React + TypeScript
│   └── src/
│       ├── App.tsx
│       └── pages/       # 各ラボのページ
├── docker/
│   └── db/
│       └── init.sql     # DB 初期化スクリプト
├── labs/                # 各ラボの解説ドキュメント
├── CLAUDE.md            # Claude への指示書
└── README.md
```

## Labs (脆弱性ラボ)

各ラボでは、意図的に脆弱なエンドポイントとUIを実装し、実際に攻撃を試します。

| # | ラボ名 | 脆弱性 | 状態 |
|---|--------|--------|------|
| 1 | SQL Injection | SQLインジェクション | 未実装 |
| 2 | XSS | クロスサイトスクリプティング | 未実装 |
| 3 | CSRF | クロスサイトリクエストフォージェリ | 未実装 |
| 4 | Broken Auth | 認証の不備 | 未実装 |
| 5 | IDOR | 安全でない直接オブジェクト参照 | 未実装 |

## ラボの追加方法

1. `backend/src/labs/` に脆弱なルートを作成
2. `frontend/src/pages/` に攻撃用UIページを作成
3. `labs/` に解説ドキュメント (Markdown) を追加
4. `backend/src/index.ts` と `frontend/src/App.tsx` にルートを登録

## ライセンス

MIT - 学習・研究目的でのみ使用してください。
