# 文字エンコーディングとセキュリティ

> 文字エンコーディングの不整合や不正なバイト列は、XSSやSQLインジェクションの入口になり得ます。本ドキュメントでは、文字集合とエンコーディングの基礎から、セキュリティ上の脆弱性パターン、そして対策までを解説します。

---

## 文字集合と文字エンコーディングの違い

まず、「文字集合（character set）」と「文字エンコーディング（character encoding）」は異なる概念である。

| 概念 | 英語 | 説明 | 例 |
|------|------|------|-----|
| **文字集合** | Character Set | 使用可能な文字の集合と、各文字に割り当てられた番号（コードポイント） | ASCII, Unicode, JIS X 0208 |
| **文字エンコーディング** | Character Encoding | 文字集合のコードポイントをバイト列に変換する規則 | UTF-8, UTF-16, Shift_JIS, EUC-JP |

一つの文字集合に対して複数のエンコーディングが存在し得る。Unicodeという文字集合に対して、UTF-8、UTF-16、UTF-32という複数のエンコーディングが存在する。

### 主要な文字集合

| 文字集合 | 文字数 | 範囲 | 特徴 |
|----------|--------|------|------|
| **ASCII** | 128文字 | 英数字、記号、制御文字 | 7ビット。すべてのエンコーディングの基礎 |
| **ISO-8859-1** (Latin-1) | 256文字 | ASCII + 西欧文字 | 8ビット。HTTPのデフォルト文字集合だった |
| **JIS X 0208** | 約6,800文字 | 日本語の漢字、ひらがな、カタカナ等 | 日本語固有の規格 |
| **Unicode** | 149,000文字以上 | 世界中の文字を包含 | 現在の標準。コードポイントは U+0000 〜 U+10FFFF |

---

## 主要な文字エンコーディング

### UTF-8

現在のWebの標準エンコーディング。Unicodeのコードポイントを1〜4バイトの可変長バイト列で表現する。

| コードポイント範囲 | バイト数 | バイト列のパターン | 文字の例 |
|-------------------|----------|-------------------|----------|
| U+0000 〜 U+007F | 1バイト | `0xxxxxxx` | A (0x41), < (0x3C) |
| U+0080 〜 U+07FF | 2バイト | `110xxxxx 10xxxxxx` | `\u00e9` (0xC3 0xA9) |
| U+0800 〜 U+FFFF | 3バイト | `1110xxxx 10xxxxxx 10xxxxxx` | あ (0xE3 0x81 0x82) |
| U+10000 〜 U+10FFFF | 4バイト | `11110xxx 10xxxxxx 10xxxxxx 10xxxxxx` | 𠮷 (0xF0 0xA0 0xAE 0xB7) |

ASCII互換性: ASCII文字（U+0000〜U+007F）は1バイトで表現され、そのバイト値はASCIIと完全に一致する。これがUTF-8が広く普及した理由の一つである。

```
文字 "A"  → U+0041 → 0x41                (1バイト)
文字 "<"  → U+003C → 0x3C                (1バイト)
文字 "あ" → U+3042 → 0xE3 0x81 0x82      (3バイト)
文字 "漢" → U+6F22 → 0xE6 0xBC 0xA2      (3バイト)
```

### Shift_JIS

日本語のレガシーエンコーディング。ASCII互換の1バイト文字と2バイトの日本語文字を混在させる。

```
文字 "A"  → 0x41                 (1バイト)
文字 "あ" → 0x82 0xA0            (2バイト)
文字 "表" → 0x95 0x5C            (2バイト) ← 2バイト目が 0x5C（バックスラッシュ）!
```

### EUC-JP

Unix系システムで使われてきた日本語エンコーディング。ASCII互換の1バイト文字と、0x80以上の値で始まる2バイトの日本語文字で構成される。

```
文字 "A"  → 0x41                 (1バイト)
文字 "あ" → 0xA4 0xA2            (2バイト)
```

EUC-JPでは日本語文字の各バイトが常に0x80以上であるため、Shift_JISのような0x5C問題は発生しない。

### ISO-2022-JP

エスケープシーケンスで文字集合を切り替える方式。電子メール（日本語）で使われてきた。

```
ESC $ B      → JIS X 0208（日本語）に切り替え
ESC ( B      → ASCII に切り替え

"日本語ABC" → ESC$B 日本語 ESC(B ABC
```

7ビット安全なため、古いメールシステムとの互換性がある。しかし、エスケープシーケンスの不正な挿入がセキュリティ問題を引き起こすことがある。

---

## UTF-8 非最短形式の脆弱性

### 非最短形式（overlong encoding）とは

UTF-8では、一つの文字を表現するために必要な最小バイト数が決まっている。しかし、エンコーディング規則上は、余分なバイトを使って同じ文字を表現することが可能である。これを**非最短形式（overlong encoding）**と呼ぶ。

文字 `<` (U+003C) のバイト表現:

| 形式 | バイト列 | バイト数 | 有効性 |
|------|----------|----------|--------|
| 最短形式（正規） | `0x3C` | 1バイト | **有効** |
| 2バイト非最短形式 | `0xC0 0xBC` | 2バイト | **無効**（RFC 3629で禁止） |
| 3バイト非最短形式 | `0xE0 0x80 0xBC` | 3バイト | **無効** |

### なぜ脆弱性になるか

多くのWebアプリケーションは、XSS対策として `<` や `>` などの危険な文字をエスケープする。しかし、**エスケープ処理がバイトレベルで `0x3C` のみをチェック**している場合、非最短形式の `0xC0 0xBC` をすり抜けてしまう。

```
攻撃の流れ:

1. 攻撃者が "<script>" の代わりに非最短形式のバイト列を送信
   "<" → 0xC0 0xBC（2バイト非最短形式）

2. アプリケーションのエスケープ処理
   "0x3C を &lt; に変換" → 0xC0 0xBC は 0x3C ではないので素通り

3. デコーダーが非最短形式を受け入れてしまう場合
   0xC0 0xBC → "<" として解釈される

4. ブラウザがHTMLとしてレンダリング
   <script>alert('XSS')</script> が実行される
```

```
# バイトレベルでの比較
正規の "<":        3C
非最短形式の "<":  C0 BC

# 文字列マッチングでは一致しないが、デコード後は同じ文字
```

### 対策

現代のUTF-8パーサ（RFC 3629準拠）は非最短形式を**不正なバイト列として拒否**する。Node.jsの `TextDecoder` もデフォルトで非最短形式を拒否する。

```javascript
// Node.jsでの検証
const decoder = new TextDecoder('utf-8', { fatal: true });

// 正規のUTF-8: 成功
const valid = new Uint8Array([0x3C]);  // "<"
console.log(decoder.decode(valid));     // → "<"

// 非最短形式: エラー
const overlong = new Uint8Array([0xC0, 0xBC]);
try {
  decoder.decode(overlong);
} catch (e) {
  console.error(e);  // TypeError: The encoded data was not valid UTF-8
}
```

ただし、古いシステムや独自実装のパーサでは非最短形式を受け入れてしまう場合がある。特に、バイト列を直接操作してフィルタリングを行うコードでは注意が必要。

---

## Shift_JIS のマルチバイト問題（5C問題）

### 0x5C問題とは

Shift_JISでは、一部の漢字の2バイト目が `0x5C`（ASCIIのバックスラッシュ `\`）と同じ値を持つ。これが文字列処理で致命的な問題を引き起こす。

```
Shift_JISで2バイト目が0x5Cになる文字の例:
  "表" → 0x95 0x5C
  "能" → 0x94 0x5C
  "ソ" → 0x83 0x5C
  "十" → 0x8F 0x5C
  "申" → 0x90 0x5C
  "予" → 0x97 0x5C
```

### セキュリティへの影響

バイト単位で `\`（0x5C）をエスケープ文字として扱うシステムでは、Shift_JISのマルチバイト文字が誤解釈される。

**SQLインジェクションの例:**

```
入力値: "表' OR 1=1--"

Shift_JISでのバイト列:
  表    →  0x95 0x5C
  '     →  0x27
  残り  →  " OR 1=1--"

もしシステムが 0x27 (') の前に 0x5C (\) を挿入してエスケープしようとすると:
  0x95 0x5C  0x5C  0x27  ...
  ↑ "表" の  ↑挿入  ↑元の'
    2バイト   された\

マルチバイト対応のパーサが処理すると:
  0x95 0x5C → "表"
  0x5C 0x27 → "\'" （エスケープされたクォート）ではなく...

しかし、マルチバイトを考慮しないパーサでは:
  0x95       → ??? (半端なバイト)
  0x5C 0x5C  → "\\"（バックスラッシュのエスケープ）
  0x27       → "'" ← クォートがエスケープされずに残る!
```

**XSSの例:**

```
入力値: 表\"><script>alert(1)</script>

Shift_JISでは "表" の2バイト目 0x5C が "\" として解釈される可能性があり、
エスケープ処理を混乱させてHTMLインジェクションを引き起こす。
```

### なぜ問題が起きるのか

根本原因は、**バイト単位の処理**と**文字単位の処理**の不一致にある:

```
Shift_JIS "表" のバイト列: 0x95 0x5C

文字単位の解釈:
  [0x95, 0x5C] → 1文字 "表"

バイト単位の解釈:
  [0x95] [0x5C] → 不明な文字 + バックスラッシュ

→ エスケープ処理がバイト単位で行われると、マルチバイト文字が破壊される
```

---

## 文字エンコーディングに起因する脆弱性の発生パターン

### パターン1: 不正なバイト列による切り詰め

不正なバイト列に遭遇したとき、一部のシステムはその時点で文字列を切り詰めてしまう。

```
入力: "安全なテキスト" + 不正バイト列 + "<script>alert(1)</script>"

処理1 (検証): 全体をスキャンし、HTMLタグを検出 → "<script>" を発見、ブロック

処理2 (エンコーディング変換): 不正バイト列に遭遇し、そこで切り詰め
  → "安全なテキスト"

処理3 (出力): 切り詰められたテキストを出力（安全に見える）

しかし、処理の順序が逆の場合:
処理1 (エンコーディング変換): 不正バイト列を無視or除去
  → "安全なテキスト<script>alert(1)</script>"

処理2 (出力): そのまま出力 → XSS発生!
```

### パターン2: エンコーディング変換時の文字化け/欠落

異なるエンコーディング間の変換で、変換先に存在しない文字が別の文字に置き換わることがある。

```
UTF-8 → Shift_JIS 変換で特殊文字が変化する例:

U+00A5 (¥) → Shift_JIS では 0x5C (\) にマッピングされる場合がある
  → SQLやJavaScriptのエスケープ文字として機能してしまう

U+FF0D (全角ハイフン −) → 一部のシステムで ASCII の "-" に変換
  → SQL の "--"（コメント）として機能する可能性
```

### パターン3: エンコーディングの自動判別の悪用

サーバーが `Content-Type` で文字エンコーディングを明示しない場合、ブラウザが自動判別を行う。攻撃者はこれを悪用して、意図しないエンコーディングで解釈させることができる。

```html
<!-- サーバーがcharsetを指定しない場合 -->
<!-- Content-Type: text/html（charsetなし） -->

<!-- 攻撃者が特殊なバイト列を注入 -->
<!-- UTF-7として解釈させる攻撃の例 -->
+ADw-script+AD4-alert(1)+ADw-/script+AD4-

<!-- ブラウザがUTF-7として解釈すると: -->
<script>alert(1)</script>
```

この攻撃は `Content-Type: text/html; charset=utf-8` のように**charsetを明示**していれば防げる。

---

## 対策

### 1. アプリケーション全体でUTF-8に統一

最も重要な対策は、**すべてのレイヤーでUTF-8を使用すること**である。

```
クライアント (UTF-8)
    ↓ リクエスト (UTF-8)
Webサーバー (UTF-8)
    ↓ クエリ (UTF-8)
データベース (UTF-8 / utf8mb4)
    ↓ レスポンス (UTF-8)
クライアント (UTF-8)
```

| レイヤー | 設定 |
|----------|------|
| HTML | `<meta charset="utf-8">` |
| HTTPレスポンス | `Content-Type: text/html; charset=utf-8` |
| データベース | `CREATE DATABASE ... CHARACTER SET utf8mb4` |
| ファイルの保存 | エディタでUTF-8を指定（BOMなし） |
| フォーム | `<form accept-charset="utf-8">` |

### 2. Content-Type でcharsetを明示

```typescript
// Honoでのレスポンスヘッダ設定
app.get('/page', (c) => {
  // ✅ charsetを明示的に指定
  return c.html(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
});

// JSONの場合（RFC 8259でUTF-8がデフォルト）
app.get('/api/data', (c) => {
  // Content-Type: application/json はcharset不要（UTF-8前提）
  return c.json({ message: 'データ' });
});
```

charsetを指定しないと、ブラウザのエンコーディング自動判別が働き、攻撃者に悪用される可能性がある。

### 3. 入力時のエンコーディング検証

入力データが正しいUTF-8であることを検証する。不正なバイト列を含む入力は拒否するか、安全に変換する。

```typescript
// Node.jsでの入力検証
function isValidUtf8(buffer: Buffer): boolean {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    decoder.decode(buffer);
    return true;
  } catch {
    return false;
  }
}

// ミドルウェアとしての実装例
app.use('*', async (c, next) => {
  const body = await c.req.text();
  const buffer = Buffer.from(body);

  // fatal: true により、不正なUTF-8バイト列でエラーになる
  const decoder = new TextDecoder('utf-8', { fatal: true });
  try {
    decoder.decode(buffer);
  } catch {
    return c.json({ error: '不正なエンコーディングです' }, 400);
  }

  await next();
});
```

---

## Node.js/TypeScript での文字エンコーディング処理

### Buffer

Node.jsの `Buffer` はバイト列を扱うためのクラス。文字列とバイト列の変換に使用する。

```typescript
// 文字列 → バイト列（UTF-8）
const buf = Buffer.from('あいう', 'utf-8');
console.log(buf);
// → <Buffer e3 81 82 e3 81 84 e3 81 86>
// "あ" = e3 81 82, "い" = e3 81 84, "う" = e3 81 86

// バイト列 → 文字列（UTF-8）
const str = buf.toString('utf-8');
console.log(str);
// → "あいう"

// バイト列を16進数で表示
console.log(buf.toString('hex'));
// → "e38182e38184e38186"

// 特定のバイトを確認
console.log(buf[0].toString(16));  // → "e3"
console.log(buf[1].toString(16));  // → "81"
console.log(buf[2].toString(16));  // → "82"
```

### TextDecoder / TextEncoder

Web標準のAPI。Node.jsでもグローバルに利用可能。

```typescript
// TextEncoder: 文字列 → UTF-8バイト列（Uint8Array）
const encoder = new TextEncoder();  // 常にUTF-8
const encoded = encoder.encode('<script>');
console.log(encoded);
// → Uint8Array [0x3C, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x3E]

// TextDecoder: バイト列 → 文字列
// fatal: true で不正なバイト列を検出
const decoder = new TextDecoder('utf-8', { fatal: true });

// 正常なUTF-8
const valid = new Uint8Array([0xE3, 0x81, 0x82]);  // "あ"
console.log(decoder.decode(valid));  // → "あ"

// 不正なバイト列（非最短形式）
const overlong = new Uint8Array([0xC0, 0xBC]);  // "<" の非最短形式
try {
  decoder.decode(overlong);
} catch (e) {
  console.error('不正なUTF-8:', e.message);
  // → "不正なUTF-8: The encoded data was not valid for encoding utf-8"
}

// 不正なバイト列（不完全なマルチバイト）
const incomplete = new Uint8Array([0xE3, 0x81]);  // "あ" の先頭2バイトのみ
try {
  decoder.decode(incomplete);
} catch (e) {
  console.error('不正なUTF-8:', e.message);
}
```

### 実践的なエンコーディング検証

```typescript
/**
 * 入力文字列が正しいUTF-8であることを検証する関数
 * セキュリティ上、不正なバイト列を含む入力は早期に拒否すべき
 */
function validateUtf8Input(input: string): boolean {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });

  try {
    // 文字列 → UTF-8バイト列 → 文字列 の往復変換
    const encoded = encoder.encode(input);
    const decoded = decoder.decode(encoded);

    // 往復変換で元の文字列と一致すれば正しいUTF-8
    return decoded === input;
  } catch {
    return false;
  }
}

/**
 * 制御文字やNull文字を検出する関数
 * Null文字はCやデータベースで文字列を切り詰める可能性がある
 */
function containsDangerousControlChars(input: string): boolean {
  // Null文字 (U+0000) は多くのシステムで文字列終端として扱われる
  if (input.includes('\0')) return true;

  // その他の危険な制御文字
  // バックスペース(U+0008)は文字を削除する効果がある環境がある
  const dangerousChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  return dangerousChars.test(input);
}
```

---

## テスト手法のヒント

文字エンコーディングに関する脆弱性をテストする際のアプローチ:

### 1. 不正なバイト列の送信

```bash
# curlで不正なバイト列を含むリクエストを送信
# 非最短形式の "<" (0xC0 0xBC) を送信
curl http://localhost:3000/api/search \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-binary $'q=\xC0\xBCscript\xC0\xBEalert(1)\xC0\xBC/script\xC0\xBE'

# 不完全なUTF-8バイト列を送信
curl http://localhost:3000/api/search \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-binary $'q=test\xE3\x81'
```

### 2. Content-Type charsetの操作

```bash
# charsetを指定せずにリクエスト
curl http://localhost:3000/page -H "Accept: text/html"
# → レスポンスにcharsetが含まれているか確認

# 異なるcharsetを指定してリクエスト
curl http://localhost:3000/api/data \
  -H "Content-Type: application/json; charset=shift_jis" \
  -d '{"name": "テスト"}'
# → サーバーがcharsetを検証しているか確認
```

### 3. Node.jsでのバイト列直接操作

```typescript
// テスト用: 不正なバイト列を含むリクエストの作成
const maliciousPayload = Buffer.from([
  0x3C,                   // "<"
  0x73, 0x63, 0x72, 0x69, 0x70, 0x74,  // "script"
  0x3E,                   // ">"
]);

// エンコーディング検証をテスト
const overlongLessThan = Buffer.from([0xC0, 0xBC]);
const decoder = new TextDecoder('utf-8', { fatal: true });
try {
  decoder.decode(overlongLessThan);
  console.log('脆弱: 非最短形式を受け入れてしまった');
} catch {
  console.log('安全: 非最短形式を正しく拒否した');
}
```

### 4. 確認すべきポイント

| チェック項目 | 確認方法 |
|-------------|----------|
| レスポンスにcharsetが指定されているか | `curl -I` でContent-Typeヘッダを確認 |
| 不正なUTF-8バイト列を拒否するか | 非最短形式や不完全なバイト列を送信して確認 |
| Null文字を含む入力を拒否するか | `\x00` を含むデータを送信して確認 |
| エンコーディング変換で特殊文字が出現しないか | 異なるcharsetを指定したリクエストを送信して確認 |
| HTMLメタタグにcharsetが指定されているか | レスポンスボディの `<meta charset>` を確認 |

---

## まとめ

文字エンコーディングに関するセキュリティの要点:

| 原則 | 理由 |
|------|------|
| UTF-8に統一する | エンコーディングの不整合がなければ、変換に起因する脆弱性は発生しない |
| Content-Typeでcharsetを明示する | ブラウザの自動判別を防ぎ、攻撃者によるエンコーディング操作を防止する |
| 入力のエンコーディングを検証する | 不正なバイト列（非最短形式等）を早期に拒否する |
| `TextDecoder({ fatal: true })` を使う | 不正なバイト列を黙って無視するのではなく、エラーとして検出する |
| バイト単位ではなく文字単位で処理する | マルチバイト文字を破壊しないようにする |
| Shift_JISやEUC-JPは新規プロジェクトで使わない | レガシーシステムとの連携でやむを得ない場合のみ、慎重に扱う |

---

## 関連ラボ

以下のラボで、文字エンコーディングの知識が関連する攻撃手法を体験できる:

### XSS（クロスサイトスクリプティング）

| ラボ | 関連する知識 |
|------|--------------|
| [XSS](../step02-injection/xss.md) | 文字エンコーディングの問題はXSSの入口になり得る。非最短形式やエンコーディング変換による特殊文字の出現が、エスケープ処理を迂回する手段として悪用される |

### SQLインジェクション

| ラボ | 関連する知識 |
|------|--------------|
| [SQLインジェクション](../step02-injection/sql-injection.md) | Shift_JISの5C問題に代表される、マルチバイト文字によるエスケープ処理の迂回がSQLインジェクションの原因になる。UTF-8統一とプレースホルダの使用が根本対策 |

### サーバーサイドの脆弱性

| ラボ | 関連する知識 |
|------|--------------|
| [XXE](../step06-server-side/xxe.md) | XMLの文字エンコーディング宣言を悪用した攻撃。XMLパーサのエンコーディング処理の問題が情報漏洩につながる |
| [CRLFインジェクション](../step06-server-side/crlf-injection.md) | 改行文字（CR: 0x0D, LF: 0x0A）の注入。文字コードレベルでの特殊文字の扱いが関連する |

---

## 参考資料

- [RFC 3629 - UTF-8, a transformation format of ISO 10646](https://datatracker.ietf.org/doc/html/rfc3629)
- [OWASP - Testing for HTTP Incoming Requests](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE-176: Improper Handling of Unicode Encoding](https://cwe.mitre.org/data/definitions/176.html)
- [MDN - TextDecoder](https://developer.mozilla.org/ja/docs/Web/API/TextDecoder)
- [MDN - TextEncoder](https://developer.mozilla.org/ja/docs/Web/API/TextEncoder)
- [Unicode Security Considerations (Unicode Technical Report #36)](https://www.unicode.org/reports/tr36/)
