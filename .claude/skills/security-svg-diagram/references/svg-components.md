# SVG Components

再利用可能なSVGコンポーネントのテンプレート集。各攻撃タイプのSVG生成時にこれらを組み合わせて使う。

## 目次

1. [アクター](#アクター)
2. [矢印](#矢印)
3. [番号バッジ](#番号バッジ)
4. [サイドバー](#サイドバー)
5. [カード](#カード)
6. [特殊ボックス](#特殊ボックス)
7. [防御コンポーネント](#防御コンポーネント)
8. [凡例](#凡例)
9. [アイコンライブラリ](#アイコンライブラリ)

---

## アクター

全アクターは `transform="translate(X, Y)"` で配置し、`filter="url(#shadow)"` を適用。

### 攻撃者 (Attacker)

```xml
<g transform="translate(CX, CY)" filter="url(#shadow)">
  <rect x="-56" y="-30" width="112" height="125" rx="12" fill="#1e1b2e" stroke="#ef4444" stroke-width="1.5"/>
  <g transform="translate(0, 10)">
    <!-- フード付き人物 -->
    <path d="M-13,-17 Q0,-28 13,-17 L13,-4 Q0,2 -13,-4 Z" fill="none" stroke="#ef4444" stroke-width="1.8"/>
    <circle cx="-4" cy="-9" r="1.8" fill="#ef4444"/>
    <circle cx="4" cy="-9" r="1.8" fill="#ef4444"/>
    <!-- 体 -->
    <path d="M-17,36 Q-17,14 0,10 Q17,14 17,36" fill="none" stroke="#ef4444" stroke-width="2"/>
    <line x1="-17" y1="36" x2="17" y2="36" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
  </g>
  <text x="0" y="72" text-anchor="middle" fill="#fca5a5" font-size="13" font-weight="700">攻撃者</text>
  <text x="0" y="86" text-anchor="middle" fill="#ef4444" font-size="9.5" opacity="0.7">Attacker</text>
</g>
```

**薄表示版（対策図用）**: `opacity="0.45"` を rect と g に追加、テキストの opacity も下げる。

### Webサーバー (Server)

```xml
<g transform="translate(CX, CY)" filter="url(#shadow)">
  <rect x="-56" y="-30" width="112" height="125" rx="12" fill="#1e1b2e" stroke="#3b82f6" stroke-width="1.5"/>
  <g transform="translate(0, 14)">
    <!-- 3段ラックサーバー -->
    <rect x="-20" y="-18" width="40" height="12" rx="3" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
    <circle cx="-12" cy="-12" r="2" fill="#3b82f6"/><circle cx="-5" cy="-12" r="2" fill="#3b82f6"/>
    <rect x="-20" y="-2" width="40" height="12" rx="3" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
    <circle cx="-12" cy="4" r="2" fill="#3b82f6"/><circle cx="-5" cy="4" r="2" fill="#3b82f6"/>
    <rect x="-20" y="14" width="40" height="12" rx="3" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
    <circle cx="-12" cy="20" r="2" fill="#3b82f6"/><circle cx="-5" cy="20" r="2" fill="#3b82f6"/>
  </g>
  <text x="0" y="72" text-anchor="middle" fill="#93c5fd" font-size="13" font-weight="700">Webサーバー</text>
  <text x="0" y="86" text-anchor="middle" fill="#3b82f6" font-size="9.5" opacity="0.7">Vulnerable App</text>
</g>
```

**保護版（対策図用）**: `stroke="#22c55e"` に変更、テキストを緑系に、盾バッジを右上に追加。

### 被害者 (Victim)

```xml
<g transform="translate(CX, CY)" filter="url(#shadow)">
  <rect x="-56" y="-30" width="112" height="125" rx="12" fill="#1e1b2e" stroke="#a855f7" stroke-width="1.5"/>
  <g transform="translate(0, 10)">
    <!-- 笑顔の人物 -->
    <circle cx="0" cy="-9" r="13" fill="none" stroke="#a855f7" stroke-width="1.8"/>
    <circle cx="-4" cy="-11" r="1.5" fill="#a855f7"/>
    <circle cx="4" cy="-11" r="1.5" fill="#a855f7"/>
    <path d="M-4,-4 Q0,1 4,-4" fill="none" stroke="#a855f7" stroke-width="1.3" stroke-linecap="round"/>
    <!-- 体 -->
    <path d="M-17,36 Q-17,14 0,10 Q17,14 17,36" fill="none" stroke="#a855f7" stroke-width="2"/>
    <line x1="-17" y1="36" x2="17" y2="36" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/>
  </g>
  <text x="0" y="72" text-anchor="middle" fill="#d8b4fe" font-size="13" font-weight="700">被害者</text>
  <text x="0" y="86" text-anchor="middle" fill="#a855f7" font-size="9.5" opacity="0.7">Victim</text>
</g>
```

### データベース (Database)

SQL Injection等で使用。

```xml
<g transform="translate(CX, CY)" filter="url(#shadow)">
  <rect x="-56" y="-30" width="112" height="125" rx="12" fill="#1e1b2e" stroke="#f59e0b" stroke-width="1.5"/>
  <g transform="translate(0, 10)">
    <ellipse cx="0" cy="-14" rx="20" ry="8" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M-20,-14 L-20,14" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M20,-14 L20,14" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
    <ellipse cx="0" cy="14" rx="20" ry="8" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M-20,0 Q0,8 20,0" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.5"/>
  </g>
  <text x="0" y="72" text-anchor="middle" fill="#fcd34d" font-size="13" font-weight="700">データベース</text>
  <text x="0" y="86" text-anchor="middle" fill="#f59e0b" font-size="9.5" opacity="0.7">Database</text>
</g>
```

### 盾バッジ（対策図アクター用）

アクターカードの右上に追加。

```xml
<g transform="translate(42, -22)">
  <path d="M0,-9 L9,-4 L9,3 Q9,9 0,12 Q-9,9 -9,3 L-9,-4 Z" fill="#22c55e" opacity="0.2" stroke="#22c55e" stroke-width="1.2"/>
  <polyline points="-3,2 -1,5 5,-2" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/>
</g>
```

---

## 矢印

### 直線矢印

```xml
<!-- 左→右 (例: Server → Victim) -->
<path d="M {startX} {Y} L {endX} {Y}" fill="none" stroke="{color}" stroke-width="2.2" marker-end="url(#arrow{Color})"/>

<!-- 右→左 (例: Victim → Server) -->
<path d="M {startX} {Y} L {endX} {Y}" fill="none" stroke="{color}" stroke-width="2.2" marker-end="url(#arrow{Color})"/>
```

対向矢印のルール:
- 上の矢印: Y = アクター中心Y - 10
- 下の矢印: Y = アクター中心Y + 32
- 最低間隔: 42px

### 曲線矢印

```xml
<!-- 上カーブ (例: Attacker → Victim, Step 1) -->
<path d="M {x1} {y1} Q {ctrlX} {ctrlY} {x2} {y2}" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="8,4" marker-end="url(#arrowRed)" filter="url(#glow)"/>

<!-- 下カーブ (例: Victim → Attacker, Step 5) — Cubic Bezier推奨 -->
<path d="M {x1} {y1} C {cp1x} {cp1y}, {cp2x} {cp2y}, {x2} {y2}" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="8,4" marker-end="url(#arrowRed)" filter="url(#glow)"/>
```

下カーブの制御点は、脆弱性ボックスやコード例より**60px以上下**に設定すること。

### 縦矢印

```xml
<!-- 例: Victim → Browser box (Step 4) -->
<path d="M {X} {startY} L {X} {endY}" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="6,3" marker-end="url(#arrowRed)"/>
```

---

## 番号バッジ

```xml
<circle cx="{X}" cy="{Y}" r="16" fill="{color}"/>
<text x="{X}" y="{Y+5}" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">{number}</text>
```

配置ルール:
- 直線矢印: 矢印の中点から上下に20px離す (上のペアは上に、下のペアは下に)
- 曲線矢印: カーブの頂点/底点付近に配置
- 縦矢印: 矢印の横（右に24px）に配置

---

## サイドバー

### 攻撃ステップ詳細

```xml
<g transform="translate(775, 100)">
  <rect x="0" y="0" width="305" height="320" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="152" y="28" text-anchor="middle" fill="#e2e8f0" font-size="14" font-weight="700">攻撃ステップ詳細</text>
  <line x1="16" y1="40" x2="289" y2="40" stroke="#334155" stroke-width="1"/>

  <!-- 各ステップ: Y=68, 124, 180, 236, 292 (間隔56px) -->
  <circle cx="34" cy="{Y}" r="13" fill="{stepColor}"/>
  <text x="34" y="{Y+5}" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">{N}</text>
  <text x="56" y="{Y-4}" fill="#f8fafc" font-size="11.5" font-weight="600">{タイトル}</text>
  <text x="56" y="{Y+12}" fill="#94a3b8" font-size="9.5">{説明1行目}</text>
  <text x="56" y="{Y+25}" fill="#94a3b8" font-size="9.5">{説明2行目}</text>
</g>
```

### 防御レイヤー一覧

```xml
<g transform="translate(785, 100)">
  <rect x="0" y="0" width="295" height="340" rx="10" fill="#0f172a" stroke="#22c55e" stroke-width="1"/>
  <text x="148" y="28" text-anchor="middle" fill="#86efac" font-size="14" font-weight="700">防御レイヤー一覧</text>
  <line x1="14" y1="42" x2="281" y2="42" stroke="#22c55e" stroke-width="0.5" opacity="0.5"/>

  <!-- 各レイヤー: Y=64, 130, 196, 262 (間隔66px) -->
  <g transform="translate(18, {Y})">
    <rect x="0" y="-8" width="18" height="18" rx="4" fill="#22c55e" opacity="0.15"/>
    <text x="9" y="6" text-anchor="middle" fill="#22c55e" font-size="11" font-weight="700">{N}</text>
    <text x="28" y="2" fill="#f8fafc" font-size="11" font-weight="600">{レイヤー名}</text>
    <text x="28" y="18" fill="#94a3b8" font-size="9">{説明1行目}</text>
    <text x="28" y="31" fill="#94a3b8" font-size="9">{説明2行目}</text>
  </g>
</g>
```

---

## カード

### 攻撃テクニックカード

```xml
<g transform="translate({CX}, {Y})" filter="url(#shadow)">
  <rect x="-120" y="0" width="240" height="38" rx="8" fill="#1e1b2e" stroke="#ef4444" stroke-width="1"/>
  <rect x="-108" y="6" width="28" height="26" rx="5" fill="#ef4444" opacity="0.1"/>
  <!-- アイコンエリア: translate(-94, 19) にアイコンを配置 -->
  <text x="10" y="16" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="600">{テクニック名}</text>
  <text x="10" y="30" text-anchor="middle" fill="#94a3b8" font-size="8.5">{簡潔な説明}</text>
</g>
```

### 防御カード（中サイズ）

```xml
<g transform="translate({CX}, {Y})" filter="url(#shadow)">
  <rect x="-95" y="-20" width="190" height="90" rx="8" fill="#052e16" stroke="#22c55e" stroke-width="1.5"/>
  <!-- アイコン: translate(-60, 22) -->
  <text x="12" y="-3" text-anchor="middle" fill="#86efac" font-size="12" font-weight="700">{防御名}</text>
  <text x="12" y="13" text-anchor="middle" fill="#bbf7d0" font-size="9">{説明}</text>
  <line x1="-80" y1="22" x2="80" y2="22" stroke="#22c55e" stroke-width="0.5" opacity="0.4"/>
  <text x="0" y="40" text-anchor="middle" fill="#22c55e" font-size="9" font-family="'Fira Code', monospace">{コード例1}</text>
  <text x="0" y="56" text-anchor="middle" fill="#22c55e" font-size="9" font-family="'Fira Code', monospace">{コード例2}</text>
</g>
```

### 防御カード（大サイズ）

```xml
<g transform="translate({CX}, {Y})" filter="url(#shadow)">
  <rect x="-150" y="-20" width="300" height="72" rx="8" fill="#052e16" stroke="#22c55e" stroke-width="1.5"/>
  <!-- アイコン: translate(-112, 14) -->
  <text x="10" y="-2" text-anchor="middle" fill="#86efac" font-size="12" font-weight="700">{防御名}</text>
  <text x="10" y="14" text-anchor="middle" fill="#bbf7d0" font-size="9">{説明}</text>
  <line x1="-136" y1="24" x2="136" y2="24" stroke="#22c55e" stroke-width="0.5" opacity="0.4"/>
  <text x="10" y="42" text-anchor="middle" fill="#22c55e" font-size="9" font-family="monospace">{コード例}</text>
</g>
```

---

## 特殊ボックス

### 脆弱性ボックス

```xml
<g transform="translate({CX}, {Y})" filter="url(#shadow)">
  <rect x="-120" y="-18" width="240" height="52" rx="8" fill="#451a03" stroke="#f97316" stroke-width="1"/>
  <text x="0" y="-1" text-anchor="middle" fill="#fdba74" font-size="11" font-weight="700">⚠ {脆弱性タイトル}</text>
  <text x="0" y="16" text-anchor="middle" fill="#fb923c" font-size="9.5" font-family="monospace">{コード例}</text>
  <text x="0" y="28" text-anchor="middle" fill="#fed7aa" font-size="8.5">{説明}</text>
</g>
```

### ブラウザボックス

被害者のブラウザ環境を表現。

```xml
<g transform="translate({CX}, {Y})" filter="url(#shadow)">
  <rect x="-68" y="-28" width="136" height="70" rx="8" fill="#1e1b2e" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="4,2"/>
  <!-- タイトルバー + 信号ボタン -->
  <rect x="-58" y="-20" width="116" height="13" rx="3" fill="#0f172a"/>
  <circle cx="-48" cy="-14" r="2.5" fill="#ef4444"/>
  <circle cx="-40" cy="-14" r="2.5" fill="#f59e0b"/>
  <circle cx="-32" cy="-14" r="2.5" fill="#22c55e"/>
  <text x="0" y="6" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="600">{タイトル}</text>
  <text x="0" y="20" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace">{コード}</text>
  <text x="0" y="34" text-anchor="middle" fill="#ef4444" font-size="8.5">{影響}</text>
</g>
```

### コード例バー

URLやリクエスト例の表示。

```xml
<g transform="translate({CX}, {Y})">
  <rect x="-195" y="-14" width="390" height="28" rx="5" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="0" y="4" text-anchor="middle" fill="#94a3b8" font-size="9.5" font-family="monospace">
    <tspan fill="#64748b">{method} </tspan>
    <tspan fill="#93c5fd">{path}</tspan>
    <tspan fill="#ef4444">{malicious}</tspan>
  </text>
</g>
```

---

## 防御コンポーネント

### ブロックマーク（✗）

矢印上に配置して攻撃が遮断されたことを表現。

```xml
<g transform="translate({X}, {Y})">
  <circle cx="0" cy="0" r="16" fill="#052e16" stroke="#22c55e" stroke-width="2" filter="url(#glowGreen)"/>
  <line x1="-6" y1="-6" x2="6" y2="6" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="6" y1="-6" x2="-6" y2="6" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
</g>
```

---

## 凡例

### 攻撃図用

```xml
<g transform="translate(775, 445)">
  <rect x="0" y="0" width="305" height="68" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="14" y="18" fill="#94a3b8" font-size="10" font-weight="600">凡例</text>
  <line x1="14" y1="34" x2="44" y2="34" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="52" y="38" fill="#fca5a5" font-size="9.5">攻撃通信</text>
  <line x1="152" y1="34" x2="182" y2="34" stroke="#3b82f6" stroke-width="2"/>
  <text x="190" y="38" fill="#93c5fd" font-size="9.5">サーバー応答</text>
  <line x1="14" y1="54" x2="44" y2="54" stroke="#a855f7" stroke-width="2"/>
  <text x="52" y="58" fill="#d8b4fe" font-size="9.5">ユーザー通信</text>
  <rect x="152" y="48" width="12" height="12" rx="2" fill="#451a03" stroke="#f97316" stroke-width="0.8"/>
  <text x="170" y="58" fill="#fdba74" font-size="9.5">脆弱性ポイント</text>
</g>
```

### 対策図用

```xml
<g transform="translate(30, 730)">
  <rect x="0" y="0" width="360" height="36" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <line x1="14" y1="18" x2="44" y2="18" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3" opacity="0.3"/>
  <text x="52" y="22" fill="#fca5a5" font-size="9" opacity="0.6">遮断された攻撃</text>
  <!-- ブロックマーク -->
  <text x="188" y="22" fill="#86efac" font-size="9">ブロックポイント</text>
  <rect x="282" y="10" width="16" height="16" rx="3" fill="#052e16" stroke="#22c55e" stroke-width="1"/>
  <text x="304" y="22" fill="#86efac" font-size="9">防御機構</text>
</g>
```

---

## アイコンライブラリ

各攻撃テクニック・防御策で使用するアイコン。`translate()` 内に配置。

### 攻撃系アイコン

| アイコン | 用途 | SVG |
|---------|------|-----|
| `</>` コード | スクリプト挿入 | `<rect><text>&lt;/&gt;</text></rect>` |
| 🍪 Cookie | Cookie窃取 | `<circle>` 2つのドット内包 |
| ✉ メール | フィッシング・罠メール | `<rect><polyline>` 封筒形 |
| 💉 注入 | SQLインジェクション | `<line>` + `<circle>` 注射器形 |
| 👤→👤 中間 | MITM | 2つの人物アイコン間に割り込み |
| 🔗 リンク | URLリダイレクト | チェーンリンク形 |
| 📋 フォーム | CSRF偽造リクエスト | フォーム＋チェックマーク |

### 防御系アイコン

| アイコン | 用途 | SVG |
|---------|------|-----|
| 🧱 壁 | WAF/Firewall | `<rect>` + 煉瓦パターン |
| 🔽 漏斗 | 入力サニタイズ | `<polygon>` 漏斗形 |
| 🛡 盾 | CSP/セキュリティヘッダー | `<path>` 盾形 + チェック |
| 🔒 鍵 | HttpOnly/暗号化 | `<rect>` + `<path>` 南京錠形 |
| 🎫 トークン | CSRFトークン | `<rect>` + `<text>` チケット形 |
| 👁 目 | 監視/ログ | `<ellipse>` + `<circle>` 目形 |
| ⏱ タイマー | レート制限 | `<circle>` + `<line>` 時計形 |
