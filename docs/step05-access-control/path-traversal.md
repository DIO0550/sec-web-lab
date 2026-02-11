# パストラバーサル

## 対象ラボ

### 1. ディレクトリトラバーサルによるファイル読み取り

- **概要**: `../` を使ってサーバー上の意図しないファイルを読み取る
- **攻撃例**: `/api/files?name=../../../etc/passwd`
- **技術スタック**: Hono API (ファイル配信エンドポイント)
- **難易度**: ★☆☆

## 参考資料

- [OWASP - Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
