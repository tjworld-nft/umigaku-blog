import type { APIRoute } from 'astro';
import { getPostSummaries } from '../lib/sanityClient';
import { NOINDEX, REDIRECTED } from '../lib/seoExclusions';

export const prerender = true;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[char]!);
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Sitemap requires the canonical site URL.');

  // 取得に失敗したらビルドを止め、記事の抜けたサイトマップを公開しない。
  const posts = await getPostSummaries();
  const paths = ['/blog/', '/blog/archive/', ...posts
    .filter((post) => !REDIRECTED.has(post.slug) && !NOINDEX.has(post.slug))
    .map((post) => `/blog/${post.slug}/`)];
  const urls = [...new Set(paths.map((path) => new URL(path, site).href))];
  // 記事のJSON-LDにはCMS文書の更新日時を使う。このサイトマップは
  // URLの発見を目的とする最小構成とし、省略可能なlastmodは付けない。
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
