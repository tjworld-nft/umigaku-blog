// 全記事に対して本文の整形（src/lib/portable.ts）を試し、何を外したか・末尾がどう終わるかを出す。
//   npm run check:body            … 要約だけ
//   npm run check:body -- --all   … 記事ごとの詳細
// 定型文の型を足したとき、外しすぎていないかをここで確かめる。
import { POSTS_QUERY } from '../src/lib/query'
import { normalizeBody, renderBody, blockText, paragraphs, makeExcerpt } from '../src/lib/portable'

const url =
  'https://d2w2igz6.api.sanity.io/v2025-02-19/data/query/production?perspective=published&query=' +
  encodeURIComponent(POSTS_QUERY)
const { result: posts } = (await (await fetch(url)).json()) as { result: any[] }
const all = process.argv.includes('--all')

let removedPosts = 0
let heroDup = 0
let leftovers = 0
for (const post of posts) {
  const n = normalizeBody(post.body, post.mainImage?.url)
  const html = renderBody(n.blocks)
  if (n.removed.length) removedPosts++
  if (n.heroAlt !== undefined || (post.body || []).length - n.blocks.length > 0) heroDup += n.heroAlt !== undefined ? 1 : 0
  const tail = n.blocks.slice(-2).map((b) => (b._type === 'image' ? '[写真]' : blockText(b).slice(0, 70))).join(' ⏎ ')
  const suspicious = /\*\*|google\.com\/search|◆|▼|<br><br>/.test(html) || /https?:\/\/[^\s<"]+(?![^<]*<\/a>)/.test(html.replace(/<[^>]+>/g, ' '))
  if (suspicious) leftovers++
  if (all || suspicious) {
    console.log(`\n${(post.publishedAt || post._createdAt).slice(0, 10)} ${post.slug}`)
    if (n.removed.length) console.log('  外した:', n.removed.join(' / '))
    console.log('  末尾:', tail)
    console.log('  抜粋:', makeExcerpt(paragraphs(n.blocks)))
    if (suspicious) {
      const marks = [...html.matchAll(/(\*\*|google\.com\/search|◆[^<]{0,40}|▼[^<]{0,50})/g)].map((m) => m[0]).slice(0, 4)
      const bare = [...html.replace(/<a [^>]*>.*?<\/a>/g, '').replace(/<[^>]+>/g, ' ').matchAll(/https?:\/\/\S+/g)].map((m) => m[0]).slice(0, 3)
      console.log('  要確認:', [...marks, ...bare].join(' | '))
    }
  }
}
console.log(`\n${posts.length}本 / 定型文を外した ${removedPosts}本 / アイキャッチの重複を外した ${heroDup}本 / 要確認 ${leftovers}本`)
