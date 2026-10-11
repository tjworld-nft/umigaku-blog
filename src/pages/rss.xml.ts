import type { APIRoute } from 'astro'
import { getListedPosts } from '../lib/posts'
import { getCategory } from '../lib/categories'
import { BLOG_DESCRIPTION, BLOG_NAME, BLOG_PATH } from '../lib/site'

export const prerender = true

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)

// 新着30本のフィード。RSSリーダーや、更新を拾いにくるサービス向け。
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('RSS requires the canonical site URL.')
  const posts = (await getListedPosts()).slice(0, 30)
  const abs = (path: string) => new URL(path, site).href
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(BLOG_NAME)}</title>
<link>${abs(BLOG_PATH)}</link>
<description>${escapeXml(BLOG_DESCRIPTION)}</description>
<language>ja</language>
<atom:link href="${abs(`${BLOG_PATH}rss.xml`)}" rel="self" type="application/rss+xml" />
${posts
  .map(
    (p) => `<item>
<title>${escapeXml(p.title)}</title>
<link>${abs(p.url)}</link>
<guid isPermaLink="true">${abs(p.url)}</guid>
<pubDate>${new Date(p.date).toUTCString()}</pubDate>
<category>${escapeXml(getCategory(p.category).name)}</category>
<description>${escapeXml(p.description)}</description>
</item>`,
  )
  .join('\n')}
</channel>
</rss>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
