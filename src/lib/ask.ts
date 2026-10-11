// 記事の下に出す「相談と次の一歩」。カテゴリごとに、読んだ人が次に見たいページへつなぐ。
// 以前は各記事の本文の末尾に、同じ紹介文とリンク集が手書きで入っていた（61本）。
// 料金などの数字はここに書かない（変わったときに直し忘れるため。リンク先のページが正）。

import type { CategoryId } from './categories'

interface Ask {
  title: string
  text: string
  links: { label: string; sub?: string; href: string }[]
}

const LICENSE = { label: 'ダイビングライセンスの料金と流れ', sub: 'オープンウォーター講習', href: '/license/' }
const ADVANCED = { label: 'アドバンス講習（AOW）', sub: 'ディープ・ナビゲーションほか5ダイブ', href: '/advanced/' }
const BEGINNER = { label: '初心者ガイド', sub: '体験とライセンス、どちらから始めるか', href: '/beginner-guide/' }
const TRIAL = { label: '体験ダイビング', sub: 'ライセンスなしで潜る半日', href: '/trial-diving/' }
const FUN = { label: 'ファンダイビング', sub: '城ヶ島のビーチ・宮川湾のボート', href: '/fun-diving/' }
const REFRESH = { label: 'リフレッシュダイビング', sub: '久しぶりに潜る方へ', href: '/refresh/' }
const SPECIALTY = { label: 'スペシャルティ講習', sub: '中性浮力・ドライスーツ・ディープなど', href: '/specialty/' }
const SEALIFE = { label: '海の生き物図鑑', sub: '三浦の海で出会える生き物', href: '/sea-life/' }
const WINTER = { label: '秋冬のダイビング', sub: '透明度が上がる季節の三浦', href: '/winter-diving/' }
const BUDDY = { label: 'お友達紹介（バディ割）', href: '/buddy/' }

export const ASK: Record<CategoryId, Ask> = {
  beginner: {
    title: '気になることは、LINEでそのまま聞いてください。',
    text: '「泳ぎが苦手でも大丈夫？」「一人でも行ける？」など、申し込む前の質問だけでも大丈夫です。',
    links: [BEGINNER, TRIAL, LICENSE],
  },
  license: {
    title: '講習の日程は、LINEで聞くのがいちばん早いです。',
    text: '空いている日のこと、泳ぎや耳抜きの心配など、申し込む前の質問だけでも大丈夫です。',
    links: [LICENSE, BEGINNER, ADVANCED],
  },
  'step-up': {
    title: '練習したいことを、LINEで聞かせてください。',
    text: '浮力、耳抜き、器材のこと。いま困っていることを一言そえてもらえれば、合う進め方をお返事します。',
    links: [ADVANCED, SPECIALTY, FUN],
  },
  'miura-sea': {
    title: '次に潜る日を、LINEで相談できます。',
    text: 'ライセンスを取ったばかりの方も、久しぶりの方も。経験本数と、心配なところを一言そえてください。',
    links: [FUN, REFRESH, WINTER],
  },
  'sea-life': {
    title: '三浦の海の様子は、LINEでも聞けます。',
    text: '行きたい日の海況や、いま見られる生き物のこと。質問だけでも大丈夫です。',
    links: [SEALIFE, FUN, WINTER],
  },
  news: {
    title: 'ご質問は、LINEでどうぞ。',
    text: '特典の使い方や日程のこと。質問だけでも大丈夫です。',
    links: [LICENSE, FUN, BUDDY],
  },
}
