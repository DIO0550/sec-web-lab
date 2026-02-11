# HTTPでの機密データ送信

## 対象ラボ

### 1. 暗号化されていない通信

- **概要**: ログインフォームがHTTPで送信され、パスワードが平文で流れる
- **攻撃例**: ブラウザのDevTools Network タブで通信を確認
- **技術スタック**: React フォーム + Hono API
- **難易度**: ★☆☆ (概念の確認)

## 参考資料

- [OWASP - Transport Layer Security](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)
