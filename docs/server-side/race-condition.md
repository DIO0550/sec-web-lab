# レースコンディション (TOCTOU)

## 対象ラボ

### 1. 同時リクエストによる二重処理

- **概要**: チェックと処理の間にタイミング差があり、同時リクエストで制約を回避できる
- **攻撃例**: 残高100円で100円の商品を同時に2回購入 → 両方成功してしまう
- **技術スタック**: Hono API + PostgreSQL
- **難易度**: ★★★

## 実装メモ

- 並行リクエスト用のスクリプトを `labs/` に用意
- トランザクションなし (脆弱) → SELECT FOR UPDATE 等で排他制御 (安全)

## 参考資料

- [OWASP - Race Conditions](https://owasp.org/www-community/vulnerabilities/Race_Conditions)
