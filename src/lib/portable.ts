// 記事本文（Sanity の Portable Text）を、表示する前に整えて HTML にする。
//
// 以前は出来上がった HTML に正規表現で <br><br> を足したり、見出しのタグを文字列置換で
// 差し替えたりしていた。段落の間隔が記事ごと・段落ごとにばらつく原因だったので、
// 「まずブロックの並びを整える（normalizeBody）→ 素直に HTML にする（renderBody）」の2段に分けた。
// ここは Astro に依存しない純粋な関数だけにしてあり、scripts/check-body.ts から全記事に対して試せる。

import { toHTML, escapeHTML, uriLooksSafe } from '@portabletext/to-html'
import { imageUrl, srcset, type SanityImage } from './image'
import type { Heading } from '../types/Post'

type Block = Record<string, any>

export interface NormalizedBody {
  blocks: Block[]
  headings: Heading[]
  /** 本文の1枚目がアイキャッチと同じ写真だったとき、その説明文（アイキャッチの alt に使う） */
  heroAlt?: string
  /** 外した定型文など（確認用。画面には出さない） */
  removed: string[]
}

export function blockText(block: Block): string {
  if (block?._type !== 'block' || !Array.isArray(block.children)) return ''
  return block.children.map((c: Block) => c.text || '').join('')
}

const isHeading = (b: Block) => b._type === 'block' && /^h[1-6]$/.test(b.style || '')
const isParagraph = (b: Block) => b._type === 'block' && !b.listItem && (b.style || 'normal') === 'normal'

// ---------------------------------------------------------------------------
// 文字まわりの手入れ
// ---------------------------------------------------------------------------

/** 行をつないだときに残った「。 」「、 」「」 」の半角空白を取る。 */
function tidyText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t　]*\n[ \t　]*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/([。、」』）])[ 　]+(?=\S)/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
}

/** Markdown の **太字** が記号のまま残っているものを、太字の指定に直す。 */
function expandBold(children: Block[]): Block[] {
  const out: Block[] = []
  for (const child of children) {
    if (child._type !== 'span' || typeof child.text !== 'string' || !child.text.includes('**')) {
      out.push(child)
      continue
    }
    const parts = child.text.split(/\*\*([^*]+?)\*\*/)
    if (parts.length < 3) {
      out.push(child)
      continue
    }
    parts.forEach((text: string, i: number) => {
      if (!text) return
      const marks: string[] = child.marks || []
      out.push({
        ...child,
        _key: `${child._key}-${i}`,
        text,
        marks: i % 2 === 1 && !marks.includes('strong') ? [...marks, 'strong'] : marks,
      })
    })
  }
  // 対になっていない記号（太字が複数の区切りにまたがっていた等）は、記号だけ消す
  return out.map((c) => (c._type === 'span' && typeof c.text === 'string' && c.text.includes('**') ? { ...c, text: c.text.replace(/\*\*/g, '') } : c))
}

/** リンク先の手入れ。旧記事に「Google検索の結果ページ」を経由する壊れたリンクがある。 */
export function fixHref(href: string): string {
  let url = (href || '').trim()
  const wrapped = url.match(/^https?:\/\/www\.google\.com\/search\?q=(https?:\/\/[^&]+)/)
  if (wrapped) url = decodeURIComponent(wrapped[1])
  url = url.replace(/^http:\/\/(www\.)?miura-diving\.com/, 'https://miura-diving.com')
  return url
}

/** 文字のまま書かれた URL をリンクにする（「ご相談はLINEへ https://lin.ee/…」のような書き方が残っている）。 */
function autolink(children: Block[], markDefs: Block[]): Block[] {
  const linkKeys = new Set(markDefs.filter((d) => d._type === 'link').map((d) => d._key))
  const out: Block[] = []
  children.forEach((child, ci) => {
    const linked = (child.marks || []).some((m: string) => linkKeys.has(m))
    if (child._type !== 'span' || typeof child.text !== 'string' || linked || !/https?:\/\//.test(child.text)) {
      out.push(child)
      return
    }
    const parts = child.text.split(/(https?:\/\/[A-Za-z0-9\-._~:/?#\[\]@!$&'*+,;=%]+)/)
    parts.forEach((text: string, i: number) => {
      if (!text) return
      if (i % 2 === 0) {
        out.push({ ...child, _key: `${child._key}-t${i}`, text })
        return
      }
      const url = text.replace(/[.,;:!?]+$/, '')
      const key = `auto-${child._key || ci}-${i}`
      markDefs.push({ _key: key, _type: 'link', href: fixHref(url) })
      out.push({ ...child, _key: `${child._key}-u${i}`, text: url.replace(/^https?:\/\//, '').replace(/\/$/, ''), marks: [...(child.marks || []), key] })
      if (url.length < text.length) out.push({ ...child, _key: `${child._key}-r${i}`, text: text.slice(url.length) })
    })
  })
  return out
}

function tidyBlock(block: Block): Block {
  if (block._type !== 'block' || !Array.isArray(block.children)) return block
  let children: Block[] = block.children.map((c: Block) =>
    c._type === 'span' && typeof c.text === 'string' ? { ...c, text: tidyText(c.text) } : c,
  )
  // 先頭と末尾の空白・改行を落とす
  const first = children.findIndex((c) => c._type === 'span')
  if (first >= 0) children[first] = { ...children[first], text: children[first].text.replace(/^[\s　]+/, '') }
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i]._type !== 'span') continue
    children[i] = { ...children[i], text: children[i].text.replace(/[\s　]+$/, '') }
    break
  }
  children = expandBold(children)
  const markDefs: Block[] = (block.markDefs || []).map((def: Block) =>
    def._type === 'link' && def.href ? { ...def, href: fixHref(def.href) } : def,
  )
  children = autolink(children, markDefs)
  return { ...block, children, markDefs }
}

// ---------------------------------------------------------------------------
// 末尾の定型文を外す
// ---------------------------------------------------------------------------
// お店の紹介と相談への案内は、ページの枠（記事の下）で1か所から出す。
// 本文の中に同じ文が何十本も入っていると、直すたびに全記事を書き換えることになる
// （2026-10 に「SUP」「夏割」の記述を71本直した）。記事の原稿には今後入れない。

const ABOUT_HEADING = /^三浦\s*海の学校について$/
const TAIL_PARAGRAPH = [
  /^◆/, // ◆ 三浦 海の学校 ご紹介 ／ ◆ LINEで空き状況をチェック … 旧記事の締めの案内は全部この記号で始まる
  /^(https?:\/\/)?(www\.)?miura-diving\.com\/?$/, // URL だけの段落
  /^https?:\/\/lin\.ee\/\S+$/,
  /^三浦\s*海の学校のウェブサイト(はこちら|で、)/,
  /公式サイトも覗いてみてください/,
  /三浦\s*海の学校\s*紹介ページへ$/,
]

function stripTail(blocks: Block[], removed: string[]): Block[] {
  let out = blocks

  // 「三浦 海の学校について」の見出しから後ろ（紹介文＋リンク集）
  for (let i = out.length - 1; i >= 0 && i >= out.length - 9; i--) {
    const b = out[i]
    if (!isHeading(b) || !ABOUT_HEADING.test(blockText(b).trim())) continue
    const rest = out.slice(i + 1)
    const onlyBoilerplate = rest.every((r) => r._type === 'block' && !isHeading(r))
    if (onlyBoilerplate) {
      removed.push(`見出し「${blockText(b).trim()}」以降の${rest.length}ブロック`)
      out = out.slice(0, i)
    }
    break
  }

  // 旧記事の「◆ 三浦 海の学校 ご紹介」「https://miura-diving.com/」
  while (out.length) {
    const last = out[out.length - 1]
    const text = blockText(last).trim()
    if (isParagraph(last) && TAIL_PARAGRAPH.some((re) => re.test(text))) {
      removed.push(`末尾の定型「${text.slice(0, 30)}」`)
      out = out.slice(0, -1)
      continue
    }
    break
  }
  return out
}

// ---------------------------------------------------------------------------
// 整える
// ---------------------------------------------------------------------------

export function normalizeBody(body: Block[] | undefined, mainImageUrl?: string): NormalizedBody {
  const removed: string[] = []
  let blocks: Block[] = (body || [])
    .filter((b) => b && (b._type === 'block' || b._type === 'image'))
    .map(tidyBlock)
    // 中身の無いブロック（旧記事は空行が1記事に15〜35個ある）
    .filter((b) => (b._type === 'image' ? Boolean(b.image?.url) : blockText(b).trim() !== ''))

  blocks = stripTail(blocks, removed)

  // 本文の1枚目がアイキャッチと同じ写真なら、本文側を外す（同じ写真が2回続くため）
  let heroAlt: string | undefined
  const firstImage = blocks.findIndex((b) => b._type === 'image')
  if (firstImage >= 0 && mainImageUrl && blocks[firstImage].image?.url === mainImageUrl) {
    heroAlt = blocks[firstImage].alt || undefined
    blocks = blocks.filter((_, i) => i !== firstImage)
  }

  // 見出しの段を揃える。h2 が無く h3 から始まる旧記事は1段上げる。h1 は本文では使わない。
  const levels = new Set(blocks.filter(isHeading).map((b) => b.style))
  const promote = !levels.has('h2') && !levels.has('h1') && levels.has('h3')
  blocks = blocks.map((b) => {
    if (!isHeading(b)) return b
    let level = Number(b.style.slice(1))
    if (level === 1) level = 2
    else if (promote) level = Math.max(2, level - 1)
    return { ...b, style: `h${Math.min(level, 4)}` }
  })

  // 目次用の id を振る
  const headings: Heading[] = []
  let n = 0
  blocks = blocks.map((b) => {
    if (!isHeading(b) || (b.style !== 'h2' && b.style !== 'h3')) return b
    const id = `sec-${++n}`
    headings.push({ id, text: blockText(b).trim(), level: b.style === 'h2' ? 2 : 3 })
    return { ...b, _hid: id }
  })

  return { blocks, headings, heroAlt, removed }
}

// ---------------------------------------------------------------------------
// HTML にする
// ---------------------------------------------------------------------------

const INTERNAL = /^(https?:\/\/(www\.)?miura-diving\.com|\/|#)/

/** 本文の幅（スマホは画面いっぱい、PCは約720px）に合わせた候補。 */
const BODY_WIDTHS = [400, 640, 800, 1200, 1440]
const BODY_SIZES = '(min-width: 800px) 720px, calc(100vw - 2.5rem)'

function figure(value: Block): string {
  const image = value.image as SanityImage | undefined
  if (!image?.url) return ''
  const natural = image.w && image.h ? image.w / image.h : 4 / 3
  const width = Math.min(image.w ?? 1200, 1440)
  const height = Math.round(width / natural)
  const tall = natural < 0.95
  const alt = escapeHTML(value.alt || '')
  const caption = value.caption ? `<figcaption>${escapeHTML(value.caption)}</figcaption>` : ''
  const bg = image.bg && /^#[0-9a-f]{3,8}$/i.test(image.bg) ? ` style="background-color:${image.bg}"` : ''
  return (
    `<figure class="fig${tall ? ' fig--tall' : ''}">` +
    `<img src="${escapeHTML(imageUrl(image.url, { w: 800 }))}" srcset="${escapeHTML(srcset(image, BODY_WIDTHS))}" ` +
    `sizes="${BODY_SIZES}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async"${bg}>` +
    `${caption}</figure>`
  )
}

const heading = (tag: string) => ({ children, value }: { children?: string; value: Block }) =>
  value._hid ? `<${tag} id="${value._hid}">${children}</${tag}>` : `<${tag}>${children}</${tag}>`

export function renderBody(blocks: Block[]): string {
  return toHTML(blocks as any, {
    onMissingComponent: false,
    components: {
      types: { image: ({ value }: { value: Block }) => figure(value) },
      block: {
        normal: ({ children }: { children?: string }) => `<p>${children}</p>`,
        h2: heading('h2'),
        h3: heading('h3'),
        h4: heading('h4'),
        blockquote: ({ children }: { children?: string }) => `<blockquote><p>${children}</p></blockquote>`,
      },
      marks: {
        link: ({ children, value }: { children: string; value?: Block }) => {
          const href = value?.href || ''
          if (!href || !uriLooksSafe(href)) return children
          const external = INTERNAL.test(href) ? '' : ' target="_blank" rel="noopener noreferrer"'
          return `<a href="${escapeHTML(href)}"${external}>${children}</a>`
        },
      },
      hardBreak: () => '<br>',
    } as any,
  })
}

// ---------------------------------------------------------------------------
// 説明文・抜粋
// ---------------------------------------------------------------------------

/** 本文の段落だけを取り出す（見出し・箇条書き・写真は除く）。 */
export function paragraphs(blocks: Block[]): string[] {
  return blocks.filter(isParagraph).map((b) => blockText(b).replace(/\n/g, '').trim()).filter(Boolean)
}

/** 見出し・箇条書きも含めた全文（文字数・関連記事の判定用）。 */
export function fullText(blocks: Block[]): string {
  return blocks.filter((b) => b._type === 'block').map((b) => blockText(b).replace(/\n/g, '')).join('\n')
}

const GREETING = /こんにちは|吉田です|^みなさん|^皆さん/

/**
 * 本文の冒頭から、あいさつを飛ばして抜粋を作る。
 * description を持たない過去記事の meta description と、一覧のカードで使う。
 */
export function makeExcerpt(paras: string[], max = 110): string {
  const sentences = paras
    .slice(0, 6)
    .flatMap((p) => p.split(/(?<=[。！？])(?![」』）])/))
    .map((s) => s.trim())
    .filter(Boolean)
  while (sentences.length > 1 && GREETING.test(sentences[0]) && sentences[0].length < 60) sentences.shift()
  let out = ''
  for (const s of sentences) {
    if (out && out.length + s.length > max) break
    out += s
    if (out.length >= max * 0.7) break
  }
  if (out.length > max) out = `${out.slice(0, max - 1).replace(/[、。！？\s]+$/, '')}…`
  return out
}
