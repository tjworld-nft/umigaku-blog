# 三浦 海の学校のブログ

AstroとSanity CMSで構築された静的ブログサイト

## 機能

- ✅ Sanity CMSとの連携
- ✅ 静的サイト生成 (SSG)
- ✅ レスポンシブデザイン
- ✅ SEO最適化
- ✅ 構造化データ (JSON-LD)
- ✅ Open Graph / Twitter Card
- ✅ `/blog` サブディレクトリ対応

## セットアップ

1. 環境変数を設定:
```bash
cp .env.example .env
```

2. `.env` ファイルにSanityの設定を追加:
```
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2025-02-19
SANITY_READ_TOKEN=your_read_token
```

3. 依存関係のインストール:
```bash
npm install
```

4. 開発サーバー起動:
```bash
npm run dev
```

## ビルド & デプロイ

1. 本番ビルド:
```bash
npm run build
```

2. `dist/` フォルダの中身を `public_html/blog/` にアップロード

## ディレクトリ構造

```
src/
├── layouts/
│   └── BaseLayout.astro     # ベースレイアウト
├── pages/
│   ├── index.astro         # 記事一覧ページ
│   └── [slug].astro        # 記事詳細ページ
├── components/
│   └── StructuredData.astro # 構造化データ
├── lib/
│   └── sanityClient.ts     # Sanity接続
└── types/
    └── Post.ts             # 型定義
```

## URL構造

- ホーム: `/blog/`
- 記事詳細: `/blog/{記事スラッグ}`

## 外部リンク

ヘッダーナビゲーションから以下にリンク:
- https://miura-diving.com/ (ホーム)
- https://miura-diving.com/license (ライセンス)
- https://miura-diving.com/fundive (ファンダイビング)
- https://miura-diving.com/activity (マリンアクティビティ)
- https://miura-diving.com/contact (お問い合わせ)

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |