# ディレクトリリスティング

## 攻撃・対策フロー図

| 攻撃図 | 対策図 |
|--------|--------|
| ![攻撃フロー](diagrams/directory-listing-attack.svg) | ![対策フロー](diagrams/directory-listing-defense.svg) |

## 対象ラボ

### 1. ファイル一覧の閲覧

- **概要**: ファイル一覧がブラウザから閲覧可能
- **攻撃例**: `/static/` にアクセスしてサーバー上のファイル一覧を取得
- **技術スタック**: Hono 静的ファイル配信
- **難易度**: ★☆☆

## 参考資料

- [OWASP - Directory Listing](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/04-Review_Old_Backup_and_Unreferenced_Files_for_Sensitive_Information)
