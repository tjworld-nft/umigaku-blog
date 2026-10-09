import type { APIRoute } from 'astro';
import { getPosts } from '../lib/sanityClient';
import type { Post } from '../types/Post';

export const prerender = true;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[char]!);
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Sitemap requires the canonical site URL.');

  // 取得に失敗したらビルドを止め、記事の抜けたサイトマップを公開しない。
  const posts: Post[] = await getPosts();
  const paths = ['/blog/', '/blog/archive/', ...posts.map((post) => `/blog/${post.slug}/`)];
  const urls = [...new Set(paths.map((path) => new URL(path, site).href))];
  // CMSの更新日時は本文の変更とは限らないため、lastmodは推測で付けない。
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
