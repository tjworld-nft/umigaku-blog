import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset:   import.meta.env.SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION,
  useCdn: true,
  token: import.meta.env.SANITY_READ_TOKEN,   // build 時のみ使用
});

export const getPosts = () =>
  client.fetch(`*[_type=="post" && defined(slug.current)]{
    _id, title, "slug": slug.current, mainImage, body, publishedAt, _createdAt
  }|order(coalesce(publishedAt, _createdAt) desc)`);

export const getPost = (slug: string) =>
  client.fetch(`*[_type=="post" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, mainImage, body, publishedAt, _createdAt
  }`, { slug });