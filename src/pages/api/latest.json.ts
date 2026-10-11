import type { APIRoute } from 'astro'
import { getListedPosts } from '../../lib/posts'
import { imageUrl } from '../../lib/image'

// 記事一覧のJSON（外から新着を読むための口）。形は以前と同じ（title / slug / excerpt / date / image）。
// 写真だけ、元のままのURL（1枚数MB）ではなく幅800pxに縮めたURLを返す。
export const GET: APIRoute = async () => {
  const latest = (await getListedPosts()).map((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.description,
    date: p.date.slice(0, 10),
    image: p.image ? imageUrl(p.image.url, { w: 800, ratio: 3 / 2 }) : '',
  }))
  return new Response(JSON.stringify(latest), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })
}
