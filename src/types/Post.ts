export interface Post {
  _id: string
  title: string
  slug: string
  /** 記事側で明示した meta/og description。無い記事は本文からの自動生成にフォールバックする */
  description?: string
  mainImage?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
    hotspot?: any
    crop?: any
  }
  body?: any[]
  publishedAt?: string
  _createdAt: string
  autoTags?: string[] // 自動生成されたタグ
}