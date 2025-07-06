import { createClient } from '@sanity/client'

const projectId = process.env.REACT_APP_SANITY_PROJECT_ID
const dataset = process.env.REACT_APP_SANITY_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing REACT_APP_SANITY_PROJECT_ID environment variable. Please add it to your .env file.')
}

if (!dataset) {
  throw new Error('Missing REACT_APP_SANITY_DATASET environment variable. Please add it to your .env file.')
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.REACT_APP_SANITY_API_VERSION || '2025-02-19',
  useCdn: true,
  token: process.env.REACT_APP_SANITY_READ_TOKEN,
})

export const getPosts = async () => {
  const query = `*[_type=="post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    "slug": slug.current,
    mainImage,
    body,
    publishedAt,
    _createdAt
  }`
  return await (client as any).fetch(query)
}

export const getPost = async (slug: string) => {
  const query = `*[_type=="post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    mainImage,
    body,
    publishedAt,
    _createdAt
  }`
  return await (client as any).fetch(query, { slug })
}