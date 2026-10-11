// 一覧の上に出す「はじめての方は、まずこの記事から」。
// 始める前によく聞かれることに答えている記事を、聞かれる順に並べる。
// slug が見つからない記事（消した・転送した）は自動で飛ばす。

export const STARTERS: { slug: string; label: string }[] = [
  { slug: 'diving-license-hiyou-souba-2026-04-15', label: 'ライセンスの費用は、総額でいくら？' },
  { slug: 'diving-license-nissu-2days-2026-08-05', label: '何日で取れる？' },
  { slug: 'oyogenai-diving-2026-04-11', label: '泳げなくても、できる？' },
  { slug: 'diving-hitori-sanka-2026-04-11', label: '一人で参加しても大丈夫？' },
  { slug: 'diving-kowai-kokufuku-2026-04-11', label: '怖い気持ちは、どうすればいい？' },
  { slug: 'diving-license-winter-miura-2026-10-10', label: '冬でもライセンスは取れる？' },
]
