import type { SanityImage } from '../lib/image'
import type { CategoryId } from '../lib/categories'

/** Sanity から取ったままの記事。 */
export interface RawPost {
  _id: string
  title: string
  slug: string
  /** 記事側で書いた meta/og の説明文。無い過去記事は本文の冒頭から作る */
  description?: string
  /** カテゴリを明示したいときだけ入れる（無ければタイトルから決める） */
  category?: string
  mainImage?: SanityImage | null
  body?: any[]
  publishedAt?: string
  _createdAt: string
  _updatedAt?: string
}

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/** 表示用に整えた記事。src/lib/posts.ts が作る。 */
export interface Post {
  id: string
  slug: string
  url: string
  title: string
  description: string
  /** 記事の頭に出すリード。Sanity に description を書いた記事だけ（本文の冒頭を自動で切り出したものは出さない） */
  lead?: string
  date: string
  updated: string
  /** 公開後に中身を直した記事だけ true（記事の上に「更新」を出す） */
  showUpdated: boolean
  image?: SanityImage
  imageAlt: string
  category: CategoryId
  html: string
  headings: Heading[]
  /** 本文の文字数（空白を除く） */
  chars: number
  minutes: number
  /** 開催場所や進め方がいまと違う時期の記事（記事の頭に一言ことわりを出す） */
  dated: boolean
  /** 検索に出さない記事 */
  noindex: boolean
  /** 本体サイトへ転送済み（一覧・サイトマップに出さない） */
  redirected: boolean
  /** 関連記事を選ぶための素の文章（タイトル＋見出し） */
  topicText: string
  bodyText: string
}
