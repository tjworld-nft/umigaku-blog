# 自動デプロイメント設定

## セットアップ

### 1. 環境変数の設定
`.env`ファイルを作成して以下を設定：

```bash
# .env
SANITY_PROJECT_ID=d2w2igz6
SANITY_DATASET=production
SANITY_API_VERSION=2025-02-19
SANITY_READ_TOKEN=your_actual_token_here

# FTP設定（サーバー情報）
FTP_HOST=your_server_host.com
FTP_USERNAME=your_ftp_username
FTP_PASSWORD=your_ftp_password
FTP_PORT=21
```

### 2. 使用方法

#### ビルド＆デプロイ（推奨）
```bash
npm run build:deploy
```

#### 個別実行
```bash
# ビルドのみ
npm run build

# デプロイのみ（既にビルド済みの場合）
npm run deploy
```

## 動作
1. Sanity CMSから最新記事を取得
2. Astroサイトをビルド
3. FTP経由で`/public_html/blog/`にアップロード

## トラブルシューティング
- FTP接続エラー → `.env`のFTP設定を確認
- ビルドエラー → Sanity設定とトークンを確認
- アップロードエラー → サーバーのディレクトリ権限を確認

## 今後の使い方
Sanityで記事を更新したら：
```bash
npm run build:deploy
```
これだけで自動アップロード完了！