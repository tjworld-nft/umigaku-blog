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
│   │   ├── index.astro            # 一覧（新しい記事12本＋カテゴリ＋「はじめての方は、まずこの記事から」）
│   │   ├── page/[page].astro      # 一覧の2ページ目以降（/blog/page/2/ …）
│   │   ├── [slug].astro           # 記事
│   │   ├── category/[category].astro  # カテゴリ（6つ）
│   │   ├── archive.astro          # 全記事一覧（年ごと）
│   │   ├── sitemap.xml.ts / rss.xml.ts
│   │   └── api/latest.json.ts     # 記事一覧のJSON
│   ├── layouts/BaseLayout.astro   # 共通の枠（ヘッダー・フッター・スマホ下の追従ボタン・head）
│   ├── components/                # PostCard / Ask（相談の帯）/ AuthorBox / Share / RelatedManga ほか
│   ├── lib/
│   │   ├── sanity.ts / query.ts   # Sanity への問い合わせ（ビルド1回につき1度だけ）
│   │   ├── posts.ts               # 記事を表示用の形に整える（ここを通したものだけを各ページが使う）
│   │   ├── portable.ts            # 本文の整形と HTML 化（定型文を外す・見出しの段を揃える・写真）
│   │   ├── image.ts               # Sanity の画像CDNに幅と形式を指定する
│   │   ├── categories.ts          # カテゴリの定義と判定
│   │   ├── ask.ts / starters.ts   # 相談の帯のつなぎ先／一覧の「まず読む」記事
│   │   ├── related.ts             # 同じ話題の記事を選ぶ
│   │   ├── relatedManga.ts        # 関連するまんが
│   │   ├── schema.ts              # 構造化データ（BlogPosting・BreadcrumbList ほか）
│   │   ├── seoExclusions.ts       # 本体へ転送した記事・検索に出さない記事
│   │   └── site.ts                # メニュー・LINEのURL・日付の書式など
│   ├── styles/blog.css            # 見た目はこの1枚（Tailwind は使っていない）
│   └── types/Post.ts
├── scripts/
│   ├── check-body.ts              # 全記事に本文の整形を試す（npm run check:body）
│   └── deploy.js                  # 手動FTPデプロイ
├── .github/workflows/deploy.yml   # ビルド→FTPデプロイ
└── astro.config.mjs               # base: '/blog'・CSSはHTMLに埋め込む
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

## 仕組み（2026-10 に作り直した）

### 見た目は本体サイトと同じ

- ヘッダー・フッター・ボタン・色・書体（Zen Maru Gothic）は本体サイト（`css/style.css` `css/page.css`）と同じ値を
  `src/styles/blog.css` に持っている。**本体のメニューを変えたら `src/lib/site.ts` も合わせる**（別リポジトリなので自動では変わらない）。
- 記事の本文（`.prose`）は 17px・行間1.95・段落の間1.3em・幅680px（スマホで1行20字、PCで40字）。
  見出しは大きさと余白と細い下線だけ。飾りの点・グラデーション・hover の拡大は使わない。
- 本文に `word-break: auto-phrase` を使わない（スマホで行末が大きくでこぼこした）。題名と見出しだけ。

### 本文の整形（src/lib/portable.ts）

Sanity の本文を「整える → HTML にする」の2段で処理する。**出来上がった HTML を正規表現でいじらない**
（以前は `<br><br>` を足す置換があり、段落の間隔がばらばらで、文中に半角スペースが入っていた）。

整えるときにやること：中身の無いブロックを外す／「。 」の半角空白を取る／記号のまま残った `**太字**` を太字に／
Google検索を経由する壊れたリンクを直す／文字のままのURLをリンクに／末尾の定型文（「三浦 海の学校について」
「◆ …」）を外す／h2 の無い記事は見出しを1段上げる／アイキャッチと同じ1枚目の写真を外す。

定型文の型を足したら `npm run check:body -- --all` で、外しすぎていないかを全記事で確かめる。

### 写真（src/lib/image.ts）

`asset.url` をそのまま `<img>` に入れない（元の写真は中央値2MB超）。必ず `imageUrl()` / `srcset()` を通して、
Sanity の画像CDNに幅・形式（`auto=format`）・画質を指定する。`width` `height` も必ず付ける（寸法は GROQ で取っている）。

### カテゴリ（src/lib/categories.ts）

12個の自動タグ（ほぼ全記事に付いていた）をやめ、1記事1カテゴリにした：
はじめての方へ／ライセンスを取る／もっと潜る／三浦の海の様子／海の生き物／お店から。
題から自動で決まる。外れたら `OVERRIDES` に1行足す。カテゴリページの「まず読む」は `featured`。

### 記事の下（相談の帯・書いた人・関連記事）

- お店の紹介と相談への案内は、**記事の本文ではなく枠で出す**（`components/Ask.astro`・中身は `lib/ask.ts`）。
  料金などの数字はここに書かない（変わったときに直し忘れる。リンク先のページが正）。
- 2026-07 より前の記事には「この記事は◯年◯月に書いたものです」のことわりが出る（`lib/posts.ts` の `DATED_BEFORE`。
  当時の施設・料金のまま書かれているため）。いまの内容に書き直した記事は `CURRENT` に入れる。

### 検索まわり

- 記事：`<title>` は「題｜三浦 海の学校」、description は Sanity の `description`（無ければ本文の冒頭から）。
- 構造化データは `lib/schema.ts`。author は本体の `/instructor/#person`、publisher は `/#org` につないである。
- `lib/seoExclusions.ts`：`REDIRECTED`（本体の `.htaccess` で301している記事。一覧・サイトマップから外す）と
  `NOINDEX`（検索に出さない記事。全記事一覧からは読める）。**本体の .htaccess と両方を一緒に直す。**
- サイトマップ `/blog/sitemap.xml`（lastmod つき）、RSS `/blog/rss.xml`。

### 記事の文章をまとめて直すとき

`BLOG_PATCH_FILE=/path/to/patch.json npm run build` で、Sanity に書き込む前の案（`{ slug: { title, description, body } }`）を
重ねてビルドできる（`lib/sanity.ts`）。本番のビルドでは指定しない。

---

## URL構造

| パス | 内容 |
|------|------|
| `/blog/` | 一覧（新しい記事） |
| `/blog/page/{n}/` | 一覧の2ページ目以降 |
| `/blog/{slug}/` | 記事 |
| `/blog/category/{id}/` | カテゴリ（beginner / license / step-up / miura-sea / sea-life / news） |
| `/blog/archive/` | 全記事一覧 |
| `/blog/sitemap.xml` `/blog/rss.xml` `/blog/api/latest.json` | サイトマップ・RSS・記事一覧JSON |

`/blog/tags/…`（旧タグページ）は廃止。本体の `.htaccess` で `/blog/` へ301している。

---

## 本体サイトとの関係

- ブログは Astro で独立して構築・デプロイ（本体は静的HTML・別リポジトリ `umigakuweb`）。
- 本体の `.htaccess` が、転送する記事の301と `/blog` の除外を持っている。
- 記事の書き方・投入は、本体リポジトリのスキル `blog-post`（`.claude/skills/blog-post/`）。
  書き方の決まりは同スキルの `references/writing-rules.md`。

---

## トラブルシューティング

| 症状 | 原因と対処 |
|------|------------|
| 記事が反映されない | Sanity に入れただけでは出ない。`gh workflow run 171853777 -R tjworld-nft/umigaku-blog --ref main` で発火 |
| FTPデプロイ失敗 | ときどき接続タイムアウトで落ちる。`gh run rerun <id> --failed` で通る |
| カテゴリが違う | `src/lib/categories.ts` の `OVERRIDES` に1行足す |
| 末尾に定型文が残る | `src/lib/portable.ts` の `TAIL_PARAGRAPH` に型を足し、`npm run check:body -- --all` |
| 開発サーバーが起動しない | `.env` が無い → `.env.example` をコピー（データは公開なので読み取りトークンは無くても動く） |

---

## コード変更時の注意点

- `astro.config.mjs` の `base: '/blog'` は変更しないこと（本体サイトとのパス整合性）
- Sanity のスキーマは `title / description / slug / publishedAt / mainImage / body` のみ
- 見た目を変えるときは、スマホ幅（390px）で実際の記事を見て確かめる。確認する記事の例：
  新しい解説（`diving-license-winter-miura-2026-10-10`）、2025年の記事（`miura-diving-aow-boat-seahorse`・見出しが1段ずれている）、
  写真の多い現場レポート
