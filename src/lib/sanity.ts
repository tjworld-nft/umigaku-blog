import { createClient } from '@sanity/client'
import type { RawPost } from '../types/Post'
import { POSTS_QUERY } from './query'

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION,
  useCdn: false, // ビルドのたびに最新を取る
  perspective: 'published', // 下書きは出さない
  token: import.meta.env.SANITY_READ_TOKEN, // ビルド時のみ（公開データなので無くても読める）
})

let cache: Promise<RawPost[]> | undefined

/**
 * 公開済みの全記事（新しい順）。ビルド1回につき Sanity へは1度だけ問い合わせる。
 * 以前はページごとに取り直していて、166ページのビルドに2分かかっていた。
 */
export function getAllPosts(): Promise<RawPost[]> {
  cache ??= client.fetch<RawPost[]>(POSTS_QUERY).then(applyDraftPatch)
  return cache
}

/**
 * 手元の確認用。BLOG_PATCH_FILE に { slug: { title, description, body } } の JSON を指定すると、
 * Sanity に書き込む前の手入れ案を重ねてビルドできる（記事の文章をまとめて直すときの下見）。
 * 本番のビルド（GitHub Actions）では指定しないので、何も起きない。
 */
async function applyDraftPatch(posts: RawPost[]): Promise<RawPost[]> {
  const file = import.meta.env.BLOG_PATCH_FILE
  if (!file) return posts
  const { readFile } = await import('node:fs/promises')
  const patch = JSON.parse(await readFile(file, 'utf8')) as Record<string, Partial<RawPost>>
  console.log(`[draft] ${Object.keys(patch).length}本の手入れ案を重ねています（${file}）`)
  return posts.map((post) => {
    const p = patch[post.slug]
    return p ? { ...post, title: p.title ?? post.title, description: p.description ?? post.description, body: p.body ?? post.body } : post
  })
}
