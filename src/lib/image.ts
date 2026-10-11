// Sanity の画像CDNに、幅・形式・画質を指定して取りにいくための小さな道具。
// 以前は asset.url をそのまま <img> に入れていたので、元の写真（中央値2.2MB・最大15MB）が
// そのまま配信されていた。ここを通せば、スマホには数十KBの WebP/AVIF が届く。

export interface SanityImage {
  url: string
  w?: number
  h?: number
  bg?: string
}

interface Options {
  w: number
  /** 指定すると、その縦横比に切り抜く（中央基準） */
  ratio?: number
  q?: number
}

export function imageUrl(src: string, { w, ratio, q = 70 }: Options): string {
  if (!src.includes('cdn.sanity.io')) return src
  const params = new URLSearchParams()
  params.set('w', String(Math.round(w)))
  if (ratio) {
    params.set('h', String(Math.round(w / ratio)))
    params.set('fit', 'crop')
  } else {
    params.set('fit', 'max') // 元より大きくはしない
  }
  params.set('auto', 'format') // 対応ブラウザには AVIF/WebP
  params.set('q', String(q))
  return `${src.split('?')[0]}?${params}`
}

/** 元の幅を超えない範囲で srcset を作る。 */
export function srcset(image: SanityImage, widths: number[], ratio?: number, q?: number): string {
  const max = image.w ?? Infinity
  const usable = widths.filter((w) => w <= max)
  // 元が小さい写真は、元の幅をいちばん大きい候補にする
  if (usable.length < widths.length && Number.isFinite(max) && !usable.includes(max)) usable.push(max)
  return usable.map((w) => `${imageUrl(image.url, { w, ratio, q })} ${Math.round(w)}w`).join(', ')
}

/** 表示する縦横比から、width/height 属性に入れる値を出す（読み込み中のずれ防止）。 */
export function dimensions(image: SanityImage, ratio?: number): { width: number; height: number } {
  const width = Math.min(image.w ?? 1200, 1600)
  const natural = image.w && image.h ? image.w / image.h : 4 / 3
  return { width, height: Math.round(width / (ratio ?? natural)) }
}
