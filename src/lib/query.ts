// Sanity への問い合わせ文。ビルド（sanity.ts）と確認用スクリプト（scripts/check-body.ts）で共有する。

// 画像は URL と一緒に元の寸法・ぼかし用の極小画像・地の色を取る。
// 寸法が無いと width/height を書けず、読み込み中に本文がずれる。
const IMAGE = `{
  "url": asset->url,
  "w": asset->metadata.dimensions.width,
  "h": asset->metadata.dimensions.height,
  "bg": asset->metadata.palette.dominant.background
}`

export const POSTS_QUERY = `*[_type=="post" && defined(slug.current)]{
  _id, title, "slug": slug.current, description, category,
  publishedAt, _createdAt, _updatedAt,
  "mainImage": mainImage${IMAGE},
  body[]{
    ...,
    _type == "image" => { _key, _type, alt, caption, "image": @${IMAGE} }
  }
}|order(coalesce(publishedAt, _createdAt) desc)`
