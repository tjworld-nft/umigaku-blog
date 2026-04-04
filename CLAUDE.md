# 三浦 海の学校 ブログ — プロジェクトガイド

## プロジェクト概要

三浦 海の学校（miura-diving.com）のブログシステム。
Astro（静的サイト生成）+ Sanity CMS（コンテンツ管理）で構築し、GitHub Actions 経由で本番サーバーに FTP デプロイする。

- **公開URL**: https://miura-diving.com/blog/
- **フレームワーク**: Astro v5（TypeScript）
- **CMS**: Sanity（プロジェクトID: `d2w2igz6` / dataset: `production`）
- **スタイリング**: Tailwind CSS v4
- **デプロイ**: GitHub Actions → FTP（`/public_html/blog/`）

---

## ディレクトリ構成

```
umigaku-blog/
├── src/
│   ├── pages/
│   │   ├── index.astro          # 記事一覧（トップページ）
│   │   ├── [slug].astro         # 記事詳細ページ
│   │   ├── tags/[tag].astro     # タグ別アーカイブ
│   │   └── api/latest.json.ts   # 最新記事JSON API
│   ├── layouts/
│   │   └── BaseLayout.astro     # 共通レイアウト（ヘッダー/フッター）
│   ├── components/
│   │   └── StructuredData.astro # JSON-LD 構造化データ
│   ├── lib/
│   │   ├── sanityClient.ts      # Sanity API接続・クエリ
│   │   ├── autoTagger.ts        # 記事の自動タグ付け（12カテゴリ）
│   │   ├── readingTime.ts       # 読了時間の算出（日本語500文字/分）
│   │   └── seoGenerator.ts      # メタデータ自動生成
│   ├── types/
│   │   └── Post.ts              # Post型定義
│   └── styles/
│       └── global.css           # グローバルCSS
├── scripts/
│   └── deploy.js                # 手動FTPデプロイスクリプト
├── .github/workflows/
│   └── deploy.yml               # CI/CD（ビルド→FTPデプロイ）
├── astro.config.mjs             # Astro設定（base: '/blog'）
├── tailwind.config.js
├── package.json
└── .env.example                 # 環境変数テンプレート
```

---

## 記事の追加・更新方法

### 方法1: Sanity Studio（ブラウザ）で直接編集

1. Sanity Studio にログイン
2. 「Post」ドキュメントを新規作成
3. 以下のフィールドを入力:
   - **title**: 記事タイトル
   - **slug**: URLスラッグ（タイトルから自動生成可）
   - **mainImage**: サムネイル画像をアップロード
   - **body**: Portable Text で本文を入力（画像埋め込み可）
   - **publishedAt**: 公開日時（未設定なら `_createdAt` が使われる）
4. 「Publish」で公開 → Webhook が GitHub Actions を自動トリガー → デプロイ完了

### 方法2: Claude の diving-blog スキルで記事生成

Claudeに「ブログを書いて」と依頼するとMarkdown記事を生成できる。
生成後、Sanity に手動投入するか、Sanity API経由で投稿する。

### 記事公開後の流れ（自動）

```
Sanity で記事を Publish
  ↓ Webhook（repository_dispatch: sanity-update）
GitHub Actions が起動
  ↓ npm ci → npm run build（Sanityから全記事取得 → 静的HTML生成）
FTP デプロイ
  ↓ dist/ → /public_html/blog/
本番サイトに反映
```

**手動でデプロイしたい場合:**
- GitHub Actions の「Run workflow」を手動実行
- または `main` ブランチにプッシュ（自動トリガー）

---

## サイトの更新方法（コードの変更）

### ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（http://localhost:4321/blog/）
npm run dev

# 本番ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

### デプロイ

**推奨: GitHub 経由（自動デプロイ）**
```bash
git add .
git commit -m "変更内容"
git push origin main
# → GitHub Actions が自動でビルド＆デプロイ
```

**手動デプロイ（.env にFTP情報が必要）**
```bash
npm run build:deploy
```

### 環境変数（.env）

```bash
SANITY_PROJECT_ID=d2w2igz6
SANITY_DATASET=production
SANITY_API_VERSION=2025-02-19
SANITY_READ_TOKEN=（Sanityの読み取りトークン）

FTP_HOST=（FTPサーバーホスト）
FTP_USERNAME=（FTPユーザー名）
FTP_PASSWORD=（FTPパスワード）
FTP_PORT=21
```

GitHub Actions 用の値は **GitHub Secrets** に設定済み（詳細: `github-secrets-setup.md`）。

---

## 主要機能の仕組み

### ページネーション（もっと見るボタン）

- `index.astro` で実装
- 初回表示: **12件**（`POSTS_PER_PAGE = 12`）
- 残りの記事データは `<script type="application/json">` としてページ内に埋め込み
- 「もっと見る」ボタンで12件ずつクライアントサイドで追加描画
- 全件表示後にボタン自動非表示
- `<noscript>` タグで全記事リンクを保持（SEO対策）
- カードにはフェードインアニメーション付き

### 自動タグ付け（autoTagger.ts）

記事のタイトルと本文からキーワードマッチで自動分類（12カテゴリ）:
- ライセンス講習、ファンダイビング、初心者向け、海況・コンディション
- 器材・装備、ビーチ情報、水中撮影、プール講習
- 安全管理、eラーニング、季節情報、よくある質問

各タグにはテーマカラーが設定されている。

### SEO自動生成（seoGenerator.ts）

記事ページに以下を自動付与:
- meta description（本文冒頭から160文字以内で生成）
- keywords（ダイビング・地域関連キーワードを本文から抽出、最大10個）
- OGP タイトル/説明（SNSシェア用）
- JSON-LD 構造化データ（Schema.org Article/WebSite）

### 記事詳細ページ（[slug].astro）

- Portable Text → HTML 変換
- 見出しスタイル（H2にアニメーション下線、H3にドットマーカー）
- 日本語向けテキスト整形（句読点後の改行、括弧処理など）
- SNSシェアボタン（X/Twitter、Facebook、Instagram）

### 最新記事API（api/latest.json.ts）

- エンドポイント: `/blog/api/latest.json`
- ホームページ（WordPress側）から最新記事を取得するために使用
- 5分間キャッシュ（`Cache-Control: public, max-age=300`）

---

## URL構造

| パス | 内容 |
|------|------|
| `/blog/` | 記事一覧（トップ） |
| `/blog/{slug}/` | 記事詳細 |
| `/blog/tags/{tag}/` | タグ別アーカイブ |
| `/blog/api/latest.json` | 最新記事JSON API |

---

## 本体サイト（WordPress/PHP）との関係

- ブログは Astro で独立して構築・デプロイ
- 本体サイトの `.htaccess` で `/blog` パスを WordPress のリライトルールから除外
- 本体のホームページから `/blog/api/latest.json` 経由で最新記事3件を表示
- ヘッダーのナビゲーションは本体サイトの各ページにリンク

---

## トラブルシューティング

| 症状 | 原因と対処 |
|------|------------|
| ビルドエラー | Sanity トークンの期限切れ → Sanity管理画面でトークンを再発行し GitHub Secrets を更新 |
| 記事が反映されない | Webhook未発火 → GitHub Actions を手動実行 or main にプッシュ |
| FTPデプロイ失敗 | FTP認証情報の変更 → GitHub Secrets の FTP_SERVER/USERNAME/PASSWORD を確認 |
| 画像が表示されない | Sanity の画像アセットURL → CDNドメイン `cdn.sanity.io` がブロックされていないか確認 |
| タグが付かない | `autoTagger.ts` のキーワードルールに該当しない → ルールを追加 |
| 開発サーバーが起動しない | `.env` ファイルが存在しない → `.env.example` をコピーして設定 |

---

## コード変更時の注意点

- `astro.config.mjs` の `base: '/blog'` は変更しないこと（本体サイトとのパス整合性）
- Sanity のスキーマを変更した場合は `src/types/Post.ts` と GROQ クエリも合わせて更新
- Tailwind CSS v4 を使用（v3 とは設定方法が異なる）
- 画像は Sanity CDN から直接配信（ローカルに画像ファイルは持たない）
- デプロイ時 `deleteRemote: false`（FTP）なので、不要ファイルはサーバーに残る場合がある
