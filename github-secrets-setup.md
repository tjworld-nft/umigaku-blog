# GitHub Secrets Setup

GitHubリポジトリで以下のシークレットを設定してください:

## 設定方法
1. GitHubリポジトリ → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** をクリック
3. 以下の値を設定:

## 必要なシークレット

### Sanity設定
- **Name**: `SANITY_PROJECT_ID`
  - **Value**: `d2w2igz6` (現在の値)

- **Name**: `SANITY_DATASET`  
  - **Value**: `production`

- **Name**: `SANITY_API_VERSION`
  - **Value**: `2025-02-19`

- **Name**: `SANITY_READ_TOKEN`
  - **Value**: [Sanityの読み取りトークン]

### FTP設定
- **Name**: `FTP_SERVER`
  - **Value**: [FTPサーバーのホスト名]

- **Name**: `FTP_USERNAME`
  - **Value**: [FTPユーザー名]

- **Name**: `FTP_PASSWORD`
  - **Value**: [FTPパスワード]

## 動作確認
1. Sanityで記事を更新
2. GitHub → **Actions** タブで実行状況を確認
3. 自動でビルド＆デプロイが実行される