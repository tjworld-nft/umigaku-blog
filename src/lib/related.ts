// 「あわせて読みたい」の記事を選ぶ。
// タイトルと見出しを2文字ずつに区切り、ほかの記事であまり使われない組み合わせほど重く数えて、
// 向きの近い記事を上から取る（TF-IDF のコサイン類似度）。同じカテゴリは少しだけ優先する。
// タグの一致で選ぶ方式は、ほぼ全記事に同じタグが付いていて意味が無かったのでやめた。

import type { Post } from '../types/Post'

type Vector = Map<string, number>

function bigrams(text: string): string[] {
  const clean = text.replace(/[\s　、。！？「」『』（）()・｜|—―─\-:：,.!?\d０-９]/g, '')
  const out: string[] = []
  for (let i = 0; i < clean.length - 1; i++) out.push(clean.slice(i, i + 2))
  return out
}

function build(posts: Post[]): Map<string, Vector> {
  const tf = new Map<string, Map<string, number>>()
  const df = new Map<string, number>()
  for (const post of posts) {
    const counts = new Map<string, number>()
    for (const g of bigrams(post.topicText)) counts.set(g, (counts.get(g) || 0) + 1)
    tf.set(post.slug, counts)
    for (const g of counts.keys()) df.set(g, (df.get(g) || 0) + 1)
  }
  const vectors = new Map<string, Vector>()
  for (const [slug, counts] of tf) {
    const v: Vector = new Map()
    let norm = 0
    for (const [g, c] of counts) {
      const w = (1 + Math.log(c)) * Math.log(posts.length / (df.get(g) || 1))
      if (w <= 0) continue
      v.set(g, w)
      norm += w * w
    }
    norm = Math.sqrt(norm) || 1
    for (const [g, w] of v) v.set(g, w / norm)
    vectors.set(slug, v)
  }
  return vectors
}

function cosine(a: Vector, b: Vector): number {
  const [small, large] = a.size < b.size ? [a, b] : [b, a]
  let sum = 0
  for (const [g, w] of small) sum += w * (large.get(g) || 0)
  return sum
}

let cached: { key: Post[]; vectors: Map<string, Vector> } | undefined

/** post に近い記事を count 本。候補は、一覧に出している記事だけ。 */
export function relatedPosts(post: Post, candidates: Post[], count = 3): Post[] {
  if (!cached || cached.key !== candidates) cached = { key: candidates, vectors: build(candidates) }
  const base = cached.vectors.get(post.slug) ?? build([post, ...candidates]).get(post.slug)!
  return candidates
    .filter((c) => c.slug !== post.slug)
    .map((c) => ({
      post: c,
      score: cosine(base, cached!.vectors.get(c.slug)!) + (c.category === post.category ? 0.04 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((r) => r.post)
}
