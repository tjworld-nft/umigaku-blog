// 記事の分類。
//
// 以前は12個のタグをキーワードの部分一致で付けていて、133本中「ビーチ情報」133本、
// 「ファンダイビング」124本…と、ほぼ全記事に同じタグが付いていた（選ぶ手がかりにならない）。
// いまは「読みに来た人が何を知りたいか」で1記事1カテゴリに分ける。
//
// 決め方は上から順に:
//   1. Sanity の記事に category があればそれ（今後の記事で明示したいとき用）
//   2. 下の OVERRIDES（過去記事を1本ずつ確かめて決めたもの）
//   3. タイトルからの判定（新しい記事はここで決まる。外れたら OVERRIDES に1行足す）
//      見る順番に意味がある：お店から → ライセンス → もっと潜る → はじめて → 生き物 → 残りは「三浦の海の様子」

export interface Category {
  id: string
  /** 画面に出す名前 */
  name: string
  /** カテゴリページの見出しの下に出す説明（検索結果の説明文にも使う） */
  lead: string
  /** 問い合わせフォームの「種別」の初期値（本体 contact/ の option の value と同じ文字） */
  formCategory: string
  /** カテゴリページの先頭に「まず読む」として出す記事（手で選ぶ・3本まで） */
  featured: readonly string[]
}

export const CATEGORIES = [
  {
    id: 'beginner',
    name: 'はじめての方へ',
    lead: '泳げなくても大丈夫か、一人で参加できるか、怖くないか。体験ダイビングやスノーケリングの日のこと、何年かぶりに潜る方のこと。始める前と、もう一度始める前に知りたいことを書いています。',
    formCategory: '体験ダイビング',
    featured: ['oyogenai-diving-2026-04-11', 'diving-hitori-sanka-2026-04-11', 'diving-kowai-kokufuku-2026-04-11'],
  },
  {
    id: 'license',
    name: 'ライセンスを取る',
    lead: 'ダイビングライセンス（Cカード）の費用と日数、講習の進み方。オープンウォーター講習の1日目から認定の日まで、城ヶ島と宮川湾での講習をその日のうちに書いた記録もここにあります。',
    formCategory: 'OWDライセンス',
    featured: ['diving-license-hiyou-souba-2026-04-15', 'diving-license-nissu-2days-2026-08-05', 'diving-license-winter-miura-2026-10-10'],
  },
  {
    id: 'step-up',
    name: 'もっと潜る',
    lead: 'ライセンスを取ったあとの話です。アドバンス講習、浮力や耳抜きの練習、ウェイトの決め方、ドライスーツや器材の選び方。講習とファンダイビングの現場で伝えていることを書いています。',
    formCategory: 'AOWライセンス',
    featured: ['miura-diving-after-c-card-2026-08-05', 'miura-enriched-air-weight-check-2026-09-02'],
  },
  {
    id: 'miura-sea',
    name: '三浦の海の様子',
    lead: '城ヶ島のビーチと宮川湾のボートで潜った日の記録です。その日の水温と透明度、うねりや台風で海に入らなかった日の判断も書いています。',
    formCategory: 'ファンダイビング',
    featured: ['miura-diving-typhoon-season-2026-07-30'],
  },
  {
    id: 'sea-life',
    name: '海の生き物',
    lead: 'ウミウシ、ダンゴウオ、ネコザメ、アオリイカ。三浦の海で出会った生き物と、出会える季節のことを書いています。',
    formCategory: 'ファンダイビング',
    featured: [],
  },
  {
    id: 'news',
    name: 'お店から',
    lead: 'つづける割やバディ割などの特典、アプリ、サイトの新しい仕組みなど、三浦 海の学校からのお知らせです。',
    formCategory: 'その他',
    featured: [],
  },
] as const satisfies readonly Category[]

export type CategoryId = (typeof CATEGORIES)[number]['id']

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!
}

export const isCategoryId = (value: unknown): value is CategoryId =>
  typeof value === 'string' && CATEGORIES.some((c) => c.id === value)

// ---------------------------------------------------------------------------
// タイトルからの判定（上から順に見て、最初に当たったもの）
// ---------------------------------------------------------------------------
const RULES: [CategoryId, RegExp][] = [
  ['news', /つづける割|バディ割|マイドライ割|新特典|アプリ|新設|お知らせ|アルバム|ゲーム|お客様から届いた声/],
  ['license', /ライセンス|OWD|オープン・?ウォーター|Cカード|PADI|認定|指導団体|ダイビング講習/],
  ['step-up', /AOW|アドバンス|スペシャルティ|ドライスーツ|器材|エンリッチ|ウェイト|浮力|フィン|ナビ|経験本数|特訓|リゾート|石垣|小笠原|マスクとスノーケル|アクションカメラ/],
  ['beginner', /体験|スノーケリング|シュノーケリング|初めて|はじめて|不安|泳げな|怖い|一人|ひとり|親子|お孫|ブランク|リフレッシュ|年ぶり|復帰|おすすめ/],
  ['sea-life', /生き物|ウミウシ|ダンゴウオ|ネコザメ|イカ|タツノオトシゴ|コケギンポ|ハナアナゴ|エイ|ハコフグ|キヌバリ|ホウボウ/],
]

// ---------------------------------------------------------------------------
// 過去記事のうち、タイトルからの判定では外れるもの（1本ずつ確かめて決めた）
// ---------------------------------------------------------------------------
const OVERRIDES: Record<string, CategoryId> = {
  // 題名に「PADI」「認定」が入るが、中身はアドバンス講習
  'miura-aow-deep-boat-2026-09-05': 'step-up',
  'miura-boat-ikada-aow-deep-2026-08-27': 'step-up',
  'miura-aow-certification-dive-2026-08-02': 'step-up',
  'miura-diving-aow-course-buddies': 'step-up',
  'padi-jr-aow-k-chan': 'step-up',
  // Cカードを取ったあとの続け方
  'miura-diving-after-c-card-2026-08-05': 'step-up',
  // 主題は海況と中止の判断（ドライスーツの採寸は後半）
  'miura-sea-closed-drysuit-fitting-2026-09-07': 'miura-sea',
  // ファンダイビングの日の記録
  'miura-fun-diving-action-camera-2026-08-11': 'miura-sea',
  'miura-diving-boat-dive-maguro-don': 'miura-sea',
  'miura-fun-diving-ogasawara-20250727': 'miura-sea',
  'miura-diving-repeater-ai-talk-20250826': 'miura-sea',
  // スノーケリング
  'snorkeling-tour-k-san-20250822': 'beginner',
  // 講習で使うプールの話
  'miura-diving-pool-merit': 'license',
}

export function classify(post: { slug: string; title: string; category?: unknown }): CategoryId {
  if (isCategoryId(post.category)) return post.category
  if (OVERRIDES[post.slug]) return OVERRIDES[post.slug]
  for (const [id, re] of RULES) if (re.test(post.title)) return id
  return 'miura-sea'
}
