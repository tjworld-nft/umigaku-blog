import type { APIRoute } from 'astro'
import { getListedPosts } from '../lib/posts'
import { CATEGORIES } from '../lib/categories'
import { BLOG_PATH } from '../lib/site'

export const prerender = true

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Sitemap requires the canonical site URL.')

  // 取得に失敗したらビルドを止め、記事の抜けたサイトマップを公開しない。
  const posts = await getListedPosts()
  const newest = posts.reduce((max, p) => (p.updated > max ? p.updated : max), posts[0]?.updated ?? '')
  const entries: { path: string; lastmod?: string }[] = [
    { path: BLOG_PATH, lastmod: newest },
    { path: `${BLOG_PATH}archive/`, lastmod: newest },
    ...CATEGORIES.filter((c) => posts.some((p) => p.category === c.id)).map((c) => ({
      path: `${BLOG_PATH}category/${c.id}/`,
      lastmod: posts.filter((p) => p.category === c.id).reduce((max, p) => (p.updated > max ? p.updated : max), ''),
    })),
    // lastmod は Sanity の更新日時（本文を直した日）。Google は正確な lastmod だけを再クロールの手がかりにする。
    ...posts.map((p) => ({ path: p.url, lastmod: p.updated })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(({ path, lastmod }) => {
    const loc = escapeXml(new URL(path, site).href)
    return lastmod ? `  <url><loc>${loc}</loc><lastmod>${lastmod.slice(0, 10)}</lastmod></url>` : `  <url><loc>${loc}</loc></url>`
  })
  .join('\n')}
</urlset>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
