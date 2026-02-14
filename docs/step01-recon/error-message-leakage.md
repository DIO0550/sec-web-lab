# エラーメッセージからの情報漏洩

## 攻撃・対策フロー図

| 攻撃図 | 対策図 |
|--------|--------|
| ![攻撃フロー](diagrams/error-message-leakage-attack.svg) | ![対策フロー](diagrams/error-message-leakage-defense.svg) |

## 対象ラボ

### 1. DB構造・内部パスの漏洩

- **概要**: エラーメッセージにSQL文、テーブル名、ファイルパス等が含まれる
- **攻撃例**: 不正なSQL入力 → レスポンスに `ERROR: relation "users" ...` が表示
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★☆☆

## 実装メモ

- A02 (Security Misconfiguration) / A10 (Exceptional Conditions) と重複するため連携可能
- エラー詳細をそのまま返す (脆弱) → 汎用メッセージに置換 (安全)

## 参考資料

- [OWASP - Improper Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
