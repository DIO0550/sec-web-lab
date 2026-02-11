# 署名なしデータの信頼

## 対象ラボ

### 1. 検証なしのクライアントデータ

- **概要**: Cookieやhiddenフィールドの値をサーバー側で検証せずにそのまま信頼する
- **攻撃例**: Cookie内の `role=user` を `role=admin` に書き換え、hiddenフィールドの価格を変更
- **技術スタック**: Hono API + Cookie
- **難易度**: ★★☆

## 参考資料

- [OWASP - Software and Data Integrity Failures](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/)
