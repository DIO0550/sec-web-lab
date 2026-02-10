# A08: Software & Data Integrity Failures — ソフトウェアとデータの整合性の不備

## 対象ラボ

### 1. 安全でないデシリアライゼーション

- **概要**: ユーザーからのシリアライズされたデータをそのまま復元し、任意のコードが実行される
- **攻撃例**: JSON内に悪意ある関数呼び出しを仕込む、`eval()` で処理されるデータを送信
- **技術スタック**: Hono API + Node.js
- **難易度**: ★★★

### 2. 署名なしデータの信頼

- **概要**: Cookieやhiddenフィールドの値をサーバー側で検証せずにそのまま信頼する
- **攻撃例**: Cookie内の `role=user` を `role=admin` に書き換え、hiddenフィールドの価格を変更
- **技術スタック**: Hono API + Cookie
- **難易度**: ★★☆

## 参考資料

- [OWASP Top 10 - A08:2021 Software and Data Integrity Failures](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/)
