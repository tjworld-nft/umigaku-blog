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
// 2026-10-12 時点で一覧に出している記事は、1本ずつ確かめてここに固定してある
// （題を直してもカテゴリが動かないように。題からの判定は、これより後に書く記事にだけ効く）。
// ---------------------------------------------------------------------------
const OVERRIDES: Record<string, CategoryId> = {
  'diving-license-winter-miura-2026-10-10': 'license', // 冬にダイビングライセンスは取れる？三浦なら実技2日・
  'miura-4beach-experience-dives-2026-09-16': 'step-up', // 1日4本のビーチダイビングは4つの違う海｜三浦で経験
  'miura-owd-swim-fin-2026-09-12': 'license', // 三浦のPADIオープンウォーター講習｜泳いでいた人は
  'miura-jogashima-boat-buoyancy-fin-2026-09-11': 'step-up', // 城ヶ島ボートで浮力とフィンの練習｜生き物を見ない日の
  'miura-owd-certified-next-day-2026-09-09': 'license', // 中止の翌日に認定ダイブ｜神奈川・三浦の城ヶ島でPAD
  'miura-sea-closed-drysuit-fitting-2026-09-07': 'miura-sea', // 城ヶ島のダイビングを海況不良でクローズにした日｜中止
  'miura-owd-aow-rain-bcd-2026-09-06': 'license', // 三浦のPADI講習、大雨でも海の中は水温24度｜BC
  'miura-aow-deep-boat-2026-09-05': 'step-up', // 宮川湾でアドバンス講習のディープとボート｜経験本数が
  'miura-owd-equalizing-aow-2026-09-04': 'license', // 耳抜きはゆっくり少しずつ｜水温24度の三浦でオープン
  'miura-drysuit-fitting-mobby-2026-09-04': 'step-up', // ドライスーツの採寸に行ってきました｜三浦の冬を自分の
  'miura-enriched-air-weight-check-2026-09-02': 'step-up', // 適正ウェイトの決め方｜三浦・城ヶ島でエンリッチドエア
  'miura-snorkeling-university-class-2026-09-01': 'beginner', // 三浦・荒井浜で大学のスノーケリング授業｜泳ぎが苦手で
  'miura-owd-certification-buoyancy-2026-08-30': 'license', // 浮力は深さで変わる｜水温23度の三浦でオープンウォー
  'miura-owd-pool-ocean-training-2026-08-29': 'license', // 曇り空の三浦でオープンウォーター講習1日目｜プールか
  'miura-diving-logbook-app-2026-08-29': 'news', // ダイビングのログブックに何を書く？三浦のスクールが作
  'ai-consult-button-2026-08-28': 'news', // お店に聞く前にAIに相談｜三浦 海の学校のサイトに付
  'miura-boat-ikada-aow-deep-2026-08-27': 'step-up', // 筏から潜る三浦のボートダイビング｜水深20m超、透明
  'miura-mask-snorkel-choosing-2026-08-26': 'step-up', // ダイビングのマスクの選び方｜講習が中止になった日に器
  'miura-typhoon-swell-closure-2026-08-25': 'miura-sea', // 台風のうねりで三浦のダイビングを中止にする日｜判断の
  'miura-owd-certification-dives-2026-08-25': 'license', // 台風のうねりが残る三浦でオープンウォーター認定｜マス
  'miura-snorkeling-owd-course-2026-08-23': 'license', // スノーケリング体験とライセンス講習を同じ日に｜8月の
  'miura-jogashima-fun-trial-2026-08-22': 'beginner', // 三浦・城ヶ島でファンダイビングと体験ダイビング｜水温
  'miura-miyagawa-2boat-ishigaki-training-2026-08-21': 'step-up', // 石垣島の旅行前に三浦でスキル練習｜宮川湾2ボートダイ
  'miura-boat-buoyancy-practice-2026-08-20': 'step-up', // 浮力コントロールだけを練習する日｜宮川湾ボートで自由
  'miura-refresh-diving-3years-2026-08-19': 'beginner', // 3年ぶりの海へ｜三浦のリフレッシュダイビングで戻るも
  'miura-refresh-fun-3dives-2026-08-19': 'beginner', // 3年ぶりのリフレッシュと月1ダイバー｜城ヶ島で3本潜
  'miura-fun-diving-oval-squid-2026-08-17': 'sea-life', // アオリイカの卵と親イカに会えた城ヶ島｜8月のファンダ
  'miura-trial-diving-junior-2026-08-16': 'beginner', // 10歳・11歳の体験ダイビング｜城ヶ島で子どもが呼吸
  'miura-aow-boat-certification-2026-08-15': 'step-up', // 宮川湾のボートでアドバンス講習修了｜深場の光と浮力、
  'miura-owd-aow-fun-trial-2026-08-14': 'license', // 豪雨明けの三浦で新しいPADIダイバーが4名｜5コー
  'miura-owd-aow-clear-day-2026-08-13': 'license', // 初めてのダイビング講習、緊張がほどける順番｜水温24
  'miura-owd-aow-set-2026-08-12': 'license', // OWDとAOWを同時に取るのはあり？三浦で一番人気の
  'miura-fun-diving-action-camera-2026-08-11': 'miura-sea', // アクションカメラで三浦の海を撮る｜城ヶ島ファンダイビ
  'miura-aow-day1-trial-diving-2026-08-10': 'step-up', // アドバンス講習1日目と体験ダイビング｜三浦でコンパス
  'miura-owd-certification-buoyancy-2026-08-09': 'license', // 浮力コントロールが変わった最後の1本｜城ヶ島でオープ
  'miura-owd-family-pool-ocean-2026-08-08': 'license', // 親子3人でダイビングライセンス講習｜三浦・城ヶ島のプ
  'miura-owd-aow-lionfish-2026-08-07': 'license', // うねりの入った城ヶ島でOWD講習とアドバンス講習｜砂
  'miura-owd-chatgpt-typhoon-2026-08-06': 'license', // ChatGPTに勧められて三浦へ｜台風明けのオープン
  'diving-license-nissu-2days-2026-08-05': 'license', // ダイビングライセンスは何日で取れる？三浦なら学科は自
  'miura-diving-after-c-card-2026-08-05': 'step-up', // Cカードを取ったあとどうする？三浦のインストラクター
  'miura-diving-typhoon13-swell-close-2026-08-05': 'miura-sea', // 台風が沖縄にいても三浦の海が荒れる理由｜うねりでクロ
  'miura-junior-open-water-2026-08-03': 'license', // 11歳のジュニアOWD講習｜台風前のうねる三浦の海で
  'miura-aow-certification-dive-2026-08-02': 'step-up', // 三浦でアドバンス認定ダイブ｜水面27度・水底19度、
  'miura-boat-diving-miyagawa-2026-07-31': 'miura-sea', // 宮川湾ボートダイビング｜7月末でも水温21度、夏の海
  'miura-diving-typhoon-season-2026-07-30': 'miura-sea', // 台風でダイビングは中止になる？三浦半島の海が荒れる仕
  'miura-fun-diving-3beach-4beach-2026-07-31': 'miura-sea', // 夏の三浦は1日3本・4本潜れる｜ファンダイビングの本
  'miura-diving-tsuzukeru-wari-2026-07-30': 'news', // ダイビングが続かないのは意志の問題じゃない｜三浦の特
  'miura-diving-buddy-discount-2026-08-01': 'news', // 友達を誘うとふたりとも得をする｜三浦のお友達紹介「バ
  'miura-diving-umiushi-season-2026-05-06': 'sea-life', // 5月の三浦はウミウシが豊作｜10年以上前の顔ぶれが戻
  'miura-diving-report-20260420': 'sea-life', // うねりの三浦で久しぶりのキヌバリ｜4月の透明度3〜4
  'miura-diving-report-20260416': 'step-up', // 300本超えのベテランがフィンワークを練習する理由｜
  'diving-license-hiyou-souba-2026-04-15': 'license', // ダイビングライセンスの費用はいくら？三浦の総額と料金
  'miura-diving-ray-nudibranch-2026-04-14': 'sea-life', // 4月の三浦ダイビング｜迷子のアカエイと、ゴマフビロー
  'diving-kowai-kokufuku-2026-04-11': 'beginner', // ダイビングが怖い人へ、原因別の5つの慣らし方｜三浦の
  'diving-hitori-sanka-2026-04-11': 'beginner', // ダイビングは一人で参加できる？三浦での集合から当日の
  'oyogenai-diving-2026-04-11': 'beginner', // 泳げなくてもダイビングはできる？器材で補えることと、
  'miura-diving-report-20250409': 'sea-life', // 水深2mでネコザメに会えた春の三浦ダイビング｜ウミウ
  'kanto-diving-osusume-2026-04-10': 'beginner', // 関東のダイビングエリア5つを比べる｜伊豆・三浦・館山
  'diving-license-kanagawa-guide-2026-04-05': 'license', // 神奈川でダイビングライセンスを取るには？費用・日数と
  'diving-license-kanagawa-miura-umiushi-2026-04-04': 'license', // 雨の日のダイビングライセンス認定ダイブ｜4月の三浦で
  'miura-diving-2026-03-29': 'sea-life', // 3月末の三浦ビーチダイビング｜ダンゴウオ探しとセトイ
  'miura-nekozame-spring-diving-2026': 'sea-life', // 巨大ネコザメと春のウミウシ4種｜新しいBCDを慣らす
  '2026-03-23': 'sea-life', // ダンゴウオを探して小雨の三浦へ｜ウミウシ5種とヒラタ
  '2026-03-21': 'sea-life', // 春濁りの三浦で会えたウミウシ4種｜3月下旬のビーチダ
  '2026-03-16': 'sea-life', // 春濁りの三浦でタツノオトシゴとムカデミノウミウシ｜3
  'miura-diving-new-gear-pool-day': 'step-up', // ダイビング器材を買ったら最初にすること｜ウェイトチェ
  'miura-diving-aow-course-deep-boat': 'step-up', // ディープダイビングで色が消える？三浦・宮川湾のアドバ
  'miura-diving-owd-english-ai-course': 'license', // 英語でダイビング講習はできる？三浦でAIの日英スライ
  'drysuit-course-fundive-repeaters-20250824': 'step-up', // 真夏にドライスーツ講習を受ける理由｜三浦の8月、陸は
  'fundiving-s-san-my-gear-20250819': 'step-up', // ダイビング器材を自分で持つ4つの理由｜月1で潜るSさ
  'owd-final-day-n-san-20250817': 'license', // 三浦でダイビングライセンス講習の最終日｜透明度2mの
  'owd-course-day1-report-20250813': 'license', // ダイビングライセンス講習1日目で練習する4つのスキル
  'pool-diving-refresh-bubblemaker-20250811': 'beginner', // 三浦でリフレッシュダイビングと9歳のバブルメーカー｜
  'miura-diving-blank-diver-revival-20250731': 'beginner', // 70歳を過ぎてダイビングに復帰｜何十年ぶりのブランク
  'miura-snorkeling-experience-20250727': 'beginner', // おじいちゃんと10歳の孫で三浦スノーケリング体験｜器
  'miura-refresh-diving-ika-hatchout': 'sea-life', // リフレッシュダイビングの日にアオリイカの孵化を見た｜
  'miura-diving-aow-course-report': 'step-up', // 三浦のアドバンス講習で何をする？中性浮力・ナビ・水中
  'miura-diving-owd-report-20250712': 'license', // 友達の付き添いでファンダイビング｜三浦のライセンス講
  'diving-license-padi-reason': 'license', // ダイビングライセンスの指導団体はどこがいい？三浦の講
}

export function classify(post: { slug: string; title: string; category?: unknown }): CategoryId {
  if (isCategoryId(post.category)) return post.category
  if (OVERRIDES[post.slug]) return OVERRIDES[post.slug]
  for (const [id, re] of RULES) if (re.test(post.title)) return id
  return 'miura-sea'
}
