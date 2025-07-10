export interface Post {
  _id: string
  title: string
  slug: string
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