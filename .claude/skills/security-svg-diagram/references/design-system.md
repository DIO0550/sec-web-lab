# Design System

セキュリティSVG図のデザイン定数。

## 目次

1. [カラーパレット](#カラーパレット)
2. [タイポグラフィ](#タイポグラフィ)
3. [間隔・サイズ定数](#間隔サイズ定数)
4. [SVG defs テンプレート](#svg-defs-テンプレート)

---

## カラーパレット

### ダークテーマ（デフォルト）

```
背景:
  bgGrad-start:    #0f172a    (濃紺)
  bgGrad-end:      #1e293b    (やや明るい紺)
  card-bg:         #1e1b2e    (アクターカード背景)
  panel-bg:        #0f172a    (サイドバー・凡例背景)
  code-bg:         #0f172a    (コード例背景)

アクターカラー:
  attacker:        #ef4444    (赤)
  attacker-light:  #fca5a5    (テキスト用明るい赤)
  server:          #3b82f6    (青)
  server-light:    #93c5fd    (テキスト用明るい青)
  victim:          #a855f7    (紫)
  victim-light:    #d8b4fe    (テキスト用明るい紫)

防御カラー:
  defense:         #22c55e    (緑)
  defense-light:   #86efac    (テキスト用明るい緑)
  defense-pale:    #bbf7d0    (サブテキスト)
  defense-bg:      #052e16    (防御カード背景)
  defense-active:  #4ade80    (アクティブ表示)

警告・脆弱性:
  warning:         #f97316    (オレンジ)
  warning-light:   #fdba74    (テキスト用明るいオレンジ)
  warning-pale:    #fed7aa    (サブテキスト)
  warning-bg:      #451a03    (脆弱性カード背景)

共通:
  text-primary:    #f8fafc    (メインテキスト)
  text-secondary:  #e2e8f0    (見出し)
  text-muted:      #94a3b8    (説明文)
  text-dim:        #64748b    (補助テキスト)
  border:          #334155    (ボーダー・区切り線)
  traffic-red:     #ef4444    (ブラウザ赤ボタン)
  traffic-yellow:  #f59e0b    (ブラウザ黄ボタン)
  traffic-green:   #22c55e    (ブラウザ緑ボタン)
```

### ライトテーマ

```
背景:
  bgGrad-start:    #f8fafc
  bgGrad-end:      #f1f5f9
  card-bg:         #ffffff
  panel-bg:        #f8fafc
  code-bg:         #f1f5f9

アクターカラー（やや濃く調整）:
  attacker:        #dc2626
  attacker-light:  #991b1b
  server:          #2563eb
  server-light:    #1e40af
  victim:          #7c3aed
  victim-light:    #5b21b6

防御カラー:
  defense:         #16a34a
  defense-light:   #15803d
  defense-bg:      #f0fdf4

警告・脆弱性:
  warning:         #ea580c
  warning-bg:      #fff7ed

共通:
  text-primary:    #0f172a
  text-secondary:  #1e293b
  text-muted:      #64748b
  border:          #cbd5e1
```

---

## タイポグラフィ

```
font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif
monospace:   'Fira Code', monospace

タイトル:        font-size="22"  font-weight="700"
サブタイトル:     font-size="12"  (text-muted)
バッジ:          font-size="10"  font-weight="600"
アクター名:       font-size="13"  font-weight="700"
アクターサブ:     font-size="9.5" opacity="0.7"
ステップタイトル:  font-size="11.5" font-weight="600"
ステップ説明:     font-size="9.5" (text-muted)
番号バッジ:       font-size="13"  font-weight="700" (白)
カードタイトル:    font-size="11"  font-weight="600"
カード説明:       font-size="8.5" (text-muted)
コード例:         font-size="9.5" font-family="monospace"
凡例テキスト:     font-size="9.5"
セクション見出し:  font-size="14"  font-weight="700"
```

---

## 間隔・サイズ定数

### viewBox

```
攻撃図: viewBox="0 0 1100 750"  (3カラムアクター + 右サイドバー + 下部カード)
対策図: viewBox="0 0 1100 780"  (防御カード分で少し縦長)
```

viewBoxは内容量に応じて調整する。全要素が収まるサイズを設定すること。

### アクターカード

```
幅: 112px  高さ: 125px  角丸: 12px
stroke-width: 1.5
中心X位置: 115 (左), 380-400 (中央), 645 (右)  ※攻撃図基準
中心Y位置: 250 (共通)
```

### 矢印

```
直線矢印:
  stroke-width: 2.2
  対向矢印のY間隔: 42px以上  (例: Step2=Y240, Step3=Y282)

曲線矢印 (Cubic Bezier):
  stroke-width: 2.2
  stroke-dasharray: "8,4"  (攻撃通信用)
  上カーブ（Step1）: 制御点Y = アクターY - 130程度
  下カーブ（Step5）: 制御点Y = 最下部要素Y + 60以上

番号バッジ:
  半径: 16px
  直線矢印の場合: 矢印の上または下に20px離す
  曲線矢印の場合: カーブ頂点付近に配置
```

### サイドバー

```
攻撃図: "攻撃ステップ詳細"
  X: 775   幅: 305   高さ: 320   角丸: 10px
  右端 = 775 + 305 = 1080 (viewBox幅1100内)

対策図: "防御レイヤー一覧"
  X: 785   幅: 295   高さ: 340
  右端 = 785 + 295 = 1080

ステップ間隔: 56px (Y方向)
```

### 下部カード

```
攻撃テクニックカード:
  幅: 240px  高さ: 38px  角丸: 8px
  アイコンエリア: 28x26px  角丸: 5px
  3枚等間隔: X中心 = 165, 465, 765

防御カード:
  小: 190x90px (入力サニタイズ, CSP)
  大: 300x72px (HttpOnly Cookie)
```

### 要素間の最低マージン

```
カード同士:                     40px以上
カードとブロックマーク（✗）:     10px以上
カードと矢印ライン（テキスト含む場合）: 20px以上
防御カードとアクターカード:       20px以上
凡例と他の要素:                  30px以上
最下部要素とviewBox下端:         20px以上
```

### マーカー（矢印の先端）

```
markerWidth: 10  markerHeight: 7  refX: 9  refY: 3.5
```

---

## SVG defs テンプレート

全SVGの `<defs>` セクションに含める共通定義:

```xml
<defs>
  <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#0f172a"/>
    <stop offset="100%" stop-color="#1e293b"/>
  </linearGradient>
  <filter id="glow">
    <feGaussianBlur stdDeviation="2.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="shadow">
    <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/>
  </filter>
  <filter id="glowGreen">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <!-- 矢印マーカー: 各色のarrowRed, arrowBlue, arrowPurple を定義 -->
  <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444"/>
  </marker>
  <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6"/>
  </marker>
  <marker id="arrowPurple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7"/>
  </marker>
</defs>
```
