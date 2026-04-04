---
title: URLエンコーディングとReferer
sidebar_position: 3
---

# URLエンコーディングとReferer

> URLに使用できる文字の制限と、パーセントエンコーディングの仕組み、そしてRefererヘッダによるプライバシー・セキュリティ上の問題を解説します。

---

## パーセントエンコーディング（URLエンコーディング）

URLには使用できる文字に制限がある。日本語や特殊文字をURLに含める場合、**パーセントエンコーディング**でエスケープする必要がある。

### 仕組み

文字をUTF-8のバイト列に変換し、各バイトを `%XX`（XXは16進数）で表現する。

| 文字 | UTF-8バイト列 | パーセントエンコーディング |
|------|---------------|---------------------------|
| スペース | `0x20` | `%20` |
| `<` | `0x3C` | `%3C` |
| `>` | `0x3E` | `%3E` |
| `"` | `0x22` | `%22` |
| `あ` | `0xE3 0x81 0x82` | `%E3%81%82` |

```bash
# curlでURLエンコーディングされたパラメータを送信
curl "http://localhost:3000/api/search?q=%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3"
# → "セキュリティ" で検索

# --data-urlencode を使うとcurlが自動でエンコードする
curl -G http://localhost:3000/api/search --data-urlencode "q=セキュリティ"
```

### セキュリティとの関連

パーセントエンコーディングはセキュリティに深く関わる:

- **XSS対策の迂回**: `<script>` を `%3Cscript%3E` と記述してWAFを回避する試み
- **パストラバーサル**: `../` を `%2E%2E%2F` や二重エンコーディング `%252E%252E%252F` で表現してフィルタを迂回
- **SQLインジェクション**: シングルクォートを `%27` でエンコードしてフィルタをすり抜ける

アプリケーション側では、**デコード後の値**に対してバリデーションやエスケープを行う必要がある。エンコーディング前の段階でチェックすると、エンコードされた攻撃文字列を見逃してしまう。

---

## Refererヘッダとプライバシー

### Refererヘッダの仕組み

ブラウザは、リンクのクリックやリソースの読み込み時に、遷移元のURLを `Referer` ヘッダとして送信する。

```http
GET /page2 HTTP/1.1
Host: example.com
Referer: https://example.com/page1?token=secret123
```

### プライバシーとセキュリティの問題

RefererヘッダにはURLのクエリ文字列も含まれるため、URLにセンシティブな情報が含まれている場合、外部サイトに漏洩する。

```http
# ユーザーが以下のURLでパスワードリセットページにアクセスしている場合
https://example.com/reset?token=a1b2c3d4e5

# そのページから外部の画像やリンクを読み込むと、Refererにトークンが漏れる
GET /image.png HTTP/1.1
Host: external-tracker.com
Referer: https://example.com/reset?token=a1b2c3d4e5
```

### 対策

```http
# Referrer-Policy ヘッダでRefererの送信を制御
Referrer-Policy: no-referrer              # Referer を一切送らない
Referrer-Policy: same-origin              # 同一オリジンにのみ送信
Referrer-Policy: strict-origin            # オリジン部分のみ送信（パスやクエリは除去）
Referrer-Policy: strict-origin-when-cross-origin  # モダンブラウザのデフォルト（オリジンのみ送信、ダウングレード時は不送信）
```

**教訓**: URLにセンシティブな情報を含めないこと。パスワードリセットトークン等をURLに含める場合は、Referrer-Policyの設定と、トークンの短寿命化を徹底する。

---

## 理解度テスト

学んだ内容をクイズで確認してみましょう:

- [URLエンコーディングとReferer - 理解度テスト](./url-encoding-quiz)

---

## 参考資料

- [MDN - Referer ヘッダー](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Referer)
- [MDN - Referrer-Policy](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Referrer-Policy)
