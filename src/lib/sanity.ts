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
  cache ??= client.fetch<RawPost[]>(POSTS_QUERY)
  return cache
}
