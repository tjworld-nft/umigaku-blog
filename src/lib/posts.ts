// Sanity の記事を、ページで使う形に整える。ここを通したものだけを各ページが使う。

import type { Post, RawPost } from '../types/Post'
import { getAllPosts } from './sanity'
import { classify } from './categories'
import { NOINDEX, REDIRECTED } from './seoExclusions'
import { fullText, makeExcerpt, normalizeBody, paragraphs, renderBody } from './portable'
import { BLOG_PATH } from './site'

const DAY = 24 * 60 * 60 * 1000

// この日より前の記事は、開催場所や講習の進め方がいまと違う（当時の施設・プール・料金のまま書かれている）。
// 記事の頭に「◯年◯月に書いたものです」と一言ことわりを出す。
// いまの内容に書き直した記事は CURRENT に入れて、ことわりを出さない。
const DATED_BEFORE = Date.parse('2026-07-01T00:00:00+09:00')
const CURRENT = new Set<string>([
  'diving-license-kanagawa-guide-2026-04-05',
  'diving-hitori-sanka-2026-04-11',
  'diving-license-hiyou-souba-2026-04-15',
])

function toPost(raw: RawPost): Post {
  const body = normalizeBody(raw.body, raw.mainImage?.url)
  const paras = paragraphs(body.blocks)
  const text = fullText(body.blocks)
  const chars = text.replace(/\s/g, '').length
  const date = raw.publishedAt || raw._createdAt
  const updated = raw._updatedAt && Date.parse(raw._updatedAt) > Date.parse(date) ? raw._updatedAt : date

  return {
    id: raw._id,
    slug: raw.slug,
    url: `${BLOG_PATH}${raw.slug}/`,
    title: raw.title.trim(),
    description: raw.description?.trim() || makeExcerpt(paras, 118),
    lead: raw.description?.trim() || undefined,
    date,
    updated,
    // 公開から3日以上たって直したものだけ「更新」を出す（公開直後の誤字直しでは出さない）
    showUpdated: Date.parse(updated) - Date.parse(date) > 3 * DAY,
    image: raw.mainImage?.url ? raw.mainImage : undefined,
    imageAlt: body.heroAlt || raw.title.trim(),
    category: classify(raw),
    html: renderBody(body.blocks),
    headings: body.headings,
    chars,
    minutes: Math.max(1, Math.round(chars / 500)),
    dated: Date.parse(date) < DATED_BEFORE && !CURRENT.has(raw.slug),
    noindex: NOINDEX.has(raw.slug),
    redirected: REDIRECTED.has(raw.slug),
    topicText: [raw.title, ...body.headings.map((h) => h.text)].join(' '),
    bodyText: text,
  }
}

let cache: Promise<Post[]> | undefined

/** 公開済みの全記事（新しい順）。転送済み・検索に出さない記事も含む。 */
export function getPosts(): Promise<Post[]> {
  cache ??= getAllPosts().then((raw) => raw.map(toPost))
  return cache
}

/**
 * 一覧・カテゴリ・関連記事・フィードに出す記事。
 * 本体サイトへ転送済みの記事と、検索に出さない記事（受付を止めているSUPの体験記、
 * ダイビングと関係の薄い話題など）は外す。後者は「全記事一覧」からは読める。
 */
export async function getListedPosts(): Promise<Post[]> {
  return (await getPosts()).filter((p) => !p.redirected && !p.noindex)
}

/** 全記事一覧（archive）に出す記事。転送済みだけ外す。 */
export async function getArchivePosts(): Promise<Post[]> {
  return (await getPosts()).filter((p) => !p.redirected)
}
