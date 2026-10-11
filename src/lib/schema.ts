// 構造化データ（JSON-LD）。本体サイトの @id（#org / #website / instructor の #person）につなげて、
// 「このブログは三浦 海の学校のもので、書いているのは吉田」という関係を検索エンジンに伝える。
// 以前は Article の author が Organization で、パンくずも無かった。

import type { Post } from '../types/Post'
import { getCategory, type Category } from './categories'
import { imageUrl } from './image'
import { AUTHOR, BLOG_DESCRIPTION, BLOG_NAME, BLOG_URL, BRAND, SITE } from './site'

const ORG = { '@id': `${SITE}/#org` }
const WEBSITE = { '@id': `${SITE}/#website` }
const BLOG = { '@id': `${BLOG_URL}#blog` }

const person = {
  '@type': 'Person',
  '@id': AUTHOR.id,
  name: AUTHOR.name,
  jobTitle: AUTHOR.role,
  url: AUTHOR.url,
  worksFor: ORG,
}

const organization = {
  '@type': 'Organization',
  '@id': ORG['@id'],
  name: BRAND,
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/image/umigaku-logo.webp` },
}

const blog = {
  '@type': 'Blog',
  '@id': BLOG['@id'],
  url: BLOG_URL,
  name: BLOG_NAME,
  description: BLOG_DESCRIPTION,
  inLanguage: 'ja',
  isPartOf: WEBSITE,
  publisher: ORG,
}

type Crumb = { name: string; url: string }

function breadcrumb(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes })

const HOME: Crumb = { name: 'ホーム', url: `${SITE}/` }
const BLOG_CRUMB: Crumb = { name: 'ブログ', url: BLOG_URL }

export function postSchema(post: Post) {
  const url = `${SITE}${post.url}`
  const category = getCategory(post.category)
  // Google は 16:9・4:3・1:1 の3種類を勧めている。元の写真から切り出したものを渡す。
  const images = post.image
    ? [16 / 9, 4 / 3, 1].map((ratio) => `${imageUrl(post.image!.url, { w: 1200, ratio, q: 80 }).replace('auto=format', 'fm=jpg')}`)
    : undefined
  return graph(
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      headline: post.title,
      description: post.description,
      image: images,
      datePublished: post.date,
      dateModified: post.updated,
      author: person,
      publisher: organization,
      isPartOf: BLOG,
      articleSection: category.name,
      inLanguage: 'ja',
      wordCount: post.chars,
    },
    breadcrumb([HOME, BLOG_CRUMB, { name: category.name, url: `${BLOG_URL}category/${category.id}/` }, { name: post.title, url }]),
  )
}

export function indexSchema(posts: Post[]) {
  return graph(
    {
      ...blog,
      blogPost: posts.slice(0, 12).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE}${p.url}`,
        datePublished: p.date,
      })),
    },
    organization,
    breadcrumb([HOME, BLOG_CRUMB]),
  )
}

export function listSchema(name: string, description: string, path: string, posts: Post[], crumbs: Crumb[]) {
  const url = `${SITE}${path}`
  return graph(
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name,
      description,
      inLanguage: 'ja',
      isPartOf: BLOG,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: posts.length,
        itemListElement: posts.slice(0, 30).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE}${p.url}`,
          name: p.title,
        })),
      },
    },
    breadcrumb([HOME, BLOG_CRUMB, ...crumbs]),
  )
}

export function categorySchema(category: Category, posts: Post[]) {
  const path = `/blog/category/${category.id}/`
  return listSchema(`${category.name}｜${BLOG_NAME}`, category.lead, path, posts, [{ name: category.name, url: `${SITE}${path}` }])
}
