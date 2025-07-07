import type { APIRoute } from 'astro';
import { getPosts } from '../../lib/sanityClient';

export const GET: APIRoute = async () => {
  try {
    const posts = await getPosts();        // Sanity 内で publishedAt desc & limit 10
    const latest = posts.slice(0, 10).map((p) => ({
      title: p.title,
      slug:  p.slug,
      excerpt: p.body?.[0]?.children?.[0]?.text ?? p.body?.[0]?.value ?? '',
      date:  p.publishedAt?.substring(0,10) ?? p._createdAt?.substring(0,10),
      image: p.mainImage?.asset?.url ?? '',
    }));
    
    return new Response(JSON.stringify(latest), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'  // 5分キャッシュ
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};