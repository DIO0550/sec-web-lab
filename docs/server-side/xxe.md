# XXE (XML External Entity) — XML外部エンティティ

## 対象ラボ

### 1. XXE によるファイル読み取り

- **概要**: XML パーサーが外部エンティティを解決し、サーバー上のファイルを読み取る
- **攻撃例**:
  ```xml
  <?xml version="1.0"?>
  <!DOCTYPE foo [
    <!ENTITY xxe SYSTEM "file:///etc/passwd">
  ]>
  <data>&xxe;</data>
  ```
- **技術スタック**: Hono API + XMLパーサー (fast-xml-parser 等)
- **難易度**: ★★☆

## 実装メモ

- XMLインポート機能を模したエンドポイントを用意
- 外部エンティティ有効 (脆弱) → 無効化 (安全) の比較

## 参考資料

- [OWASP - XXE](https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing)
