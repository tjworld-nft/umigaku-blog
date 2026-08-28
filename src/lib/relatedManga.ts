// 記事の内容から、本体サイトの解説まんが（https://miura-diving.com/manga/）の関連話を選ぶ。
// カタログは本体リポジトリの manga/episodes.json と対応させる（新作を足したらここにも1件追加）。
// 役割分担: ブログ＝テキストで検索順位を取る／まんが＝ブログと商用ページから張られる視覚的な補助。
// 記事末尾に「関連するまんが」として最大2件を出し、まんが側へ内部リンクを流す。

export interface MangaEpisode {
  slug: string
  ep: number
  short: string       // まんがの見出し（h1）
  lead: string        // 検索語寄りの一行（title の先頭）
  keywords: string[]  // 記事本文に出てきたら関連とみなす語
}

export const MANGA_BASE = 'https://miura-diving.com/manga/'

export const mangaEpisodes: MangaEpisode[] = [
  { slug: 'diving-license', ep: 1, short: 'Cカードって、なんですか？', lead: 'Cカードとは？ダイビングライセンスの基本をまんがで',
    keywords: ['Cカード', 'ライセンス', 'オープンウォーター', 'OWD', '講習', '資格', '認定'] },
  { slug: 'refresh', ep: 2, short: 'ブランクは、1日で戻る', lead: 'ブランクダイバーのリフレッシュダイビングをまんがで',
    keywords: ['リフレッシュ', 'ブランク', '久しぶり', '何年ぶり', '年ぶり'] },
  { slug: 'aow', ep: 3, short: '「ついて回る側」から抜ける', lead: 'AOW（アドバンス）を取る意味をまんがで',
    keywords: ['AOW', 'アドバンス', 'ナビゲーション', 'ディープ', '中性浮力'] },
  { slug: 'trial-diving', ep: 4, short: '決めるのは、潜ってからでいい', lead: '体験ダイビングってどんな感じ？1日の流れをまんがで',
    keywords: ['体験ダイビング', '体験', 'はじめて', '初めて', 'ディスカバー'] },
  { slug: 'fun-diving-debut', ep: 5, short: '講習は練習、ファンダイビングが本編', lead: 'Cカード取得後の初ファンダイビング、不安をまんがで',
    keywords: ['ファンダイビング', 'デビュー', '取りたて', '初ファン'] },
  { slug: 'jpyc-payment', ep: 6, short: '財布は、海に連れていけない', lead: 'JPYCでダイビング料金を支払う話をまんがで',
    keywords: ['JPYC', 'ステーブルコイン', '決済', '支払い', 'キャッシュレス'] },
  { slug: 'owd-aow-set', ep: 7, short: '2枚目は、忘れないうちに', lead: 'OWDとAOWのセット受講（同時申込）をまんがで',
    keywords: ['セット受講', '同時', 'OWDとAOW', 'まとめて取', '一気に'] },
  { slug: 'age-no-limit', ep: 8, short: '上に、線はない', lead: 'ダイビングに年齢の上限はある？健康条件をまんがで',
    keywords: ['年齢', 'シニア', '60代', '70代', '何歳', 'ジュニア', '病歴', 'チェックシート', '健康'] },
  { slug: 'this-years-sea', ep: 9, short: '今年の海は、今年しかない', lead: '秋のダイビング—9月・10月の相模湾の水温をまんがで',
    keywords: ['秋', '9月', '10月', '季節来遊魚', '平年値', 'シーズン終わり'] },
  { slug: 'gear-rental', ep: 10, short: '器材は、レンタルでいい', lead: 'ダイビング器材はレンタルでいい？費用と揃え方をまんがで',
    keywords: ['レンタル', '器材', 'BCD', 'レギュレーター', '費用', '初期費用', 'いくら'] },
  { slug: 'overseas-diving', ep: 11, short: '海外の海は、上級者になってからじゃない', lead: '海外ダイビングは上級者だけ？初心者の疑問をまんがで',
    keywords: ['海外', 'パラオ', 'セブ', '沖縄', 'ログブック', '海外ツアー', 'ダイビングツアー', '海外旅行'] },
  { slug: 'miura-kaiou', ep: 12, short: '筏の下を見てきたから言える。三崎の海上釣り堀・みうら海王', lead: '三崎の海上釣り堀・みうら海王を筏の下から紹介するまんが',
    keywords: ['みうら海王', '釣り堀', '海上釣り堀', '釣り', '三崎港', 'うらり'] },
  { slug: 'dive-a-lot', ep: 13, short: 'ウェットの海は、あと少し。まとめて潜ると、ぐんとうまくなる', lead: 'ウェットスーツは何月まで？秋にまとめて潜る話をまんがで',
    keywords: ['ウェットスーツ', 'ウエットスーツ', 'つづける割', '上達', '間隔', '月に1回'] },
  { slug: 'winter-drysuit', ep: 14, short: '冬の海は、いちばん青い。ドライスーツで、海の季節は終わらない', lead: '冬のダイビングとドライスーツをまんがで',
    keywords: ['ドライスーツ', '冬', 'ダンゴウオ', '寒い', '真冬', '冬季'] },
  { slug: 'autumn-tropical', ep: 15, short: '秋の三浦は、海がいちばん南国になる。南の魚は、向こうから来る', lead: '秋のダイビングと季節来遊魚をまんがで',
    keywords: ['季節来遊魚', '黒潮', '秋', 'ツノダシ', 'ハタタテダイ', 'ミツボシクロスズメダイ', '南の魚', '台風'] },
  { slug: 'dream-seas', ep: 16, short: 'Cカードを取ったら、世界の海が待ってる', lead: '海外の人気ダイビングスポットをまんがで',
    keywords: ['海外', 'セブ', 'パラオ', 'モルディブ', 'グレートバリアリーフ', 'ガラパゴス', 'グアム', 'サイパン', 'マンタ', 'ダイブナビ', '世界'] },
  { slug: 'ccard-is-start', ep: 17, short: 'Cカードは、取った日がスタート', lead: 'Cカード取得後の楽しみ方・続け方をまんがで',
    keywords: ['取得後', '続ける', 'つづける割', '月に1回', '月1', 'ライフスタイル', '習慣', '次の予約', 'ログ付け'] },
  { slug: 'women-diving', ep: 18, short: '気になることは、ぜんぶ先に答えておくね', lead: '女性が気になるメイク・髪・日焼け・生理の疑問をまんがで',
    keywords: ['女性', 'メイク', '化粧', '髪', '日焼け', '日焼け止め', 'リーフセーフ', '生理', '更衣室', 'シャワー', '一人参加', '持ち物'] },
  { slug: 'ai-consult', ep: 19, short: 'お店に聞く前に、AIに聞いていい', lead: 'フッターの「AIに相談する」ボタンの使い方をまんがで',
    keywords: ['AIに相談', 'AI相談', '相談', '不安', '問い合わせ', '質問', '聞きにくい', '合うか', '一人参加', 'ブランク'] },
  { slug: 'logbook-app', ep: 20, short: '伝えるの次は、作る', lead: 'ダイビングのログブックアプリをまんがで',
    keywords: ['ログブック', 'ログ', 'ダイビングログ', '記録', 'アプリ', '本数', '経験本数', '図鑑', 'マイ図鑑'] },
]

// 記事に何も引っかからないときに出す常緑の2話
const FALLBACK = ['diving-license', 'fun-diving-debut']

export function pickRelatedManga(title: string, bodyText: string, max = 2): MangaEpisode[] {
  const t = title || ''
  const b = bodyText || ''
  const scored = mangaEpisodes.map((e) => {
    let score = 0
    for (const k of e.keywords) {
      if (t.includes(k)) score += 3
      const n = b.split(k).length - 1
      score += Math.min(n, 5) // 本文の出現回数（上限5）
    }
    return { e, score }
  })
  const hits = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || b.e.ep - a.e.ep)
  const picked = hits.slice(0, max).map((s) => s.e)
  if (picked.length < max) {
    for (const slug of FALLBACK) {
      if (picked.length >= max) break
      const e = mangaEpisodes.find((x) => x.slug === slug)!
      if (!picked.includes(e)) picked.push(e)
    }
  }
  return picked
}
