# ファイルアップロード攻撃

## 対象ラボ

### 1. 悪意あるファイルのアップロード

- **概要**: ファイルの種類や内容を検証せず、Webシェル等の実行可能ファイルをアップロード可能
- **攻撃例**: `.js` や `.html` ファイルをアップロードし、サーバー上で実行 / ブラウザで表示
- **技術スタック**: Hono API (multipart/form-data)
- **難易度**: ★★☆

## 実装メモ

- ファイル名・MIME・拡張子いずれも未検証 (脆弱) → ホワイトリスト + コンテンツ検証 (安全)
- アップロードされたファイルの配信ディレクトリにも注意

## 参考資料

- [OWASP - Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
