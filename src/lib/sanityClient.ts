import { createClient } from '@sanity/client';
import type { PostSummary } from '../types/Post';

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset:   import.meta.env.SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION,
  useCdn: false, // キャッシュを無効化して最新データを取得
  perspective: 'published', // 一覧・記事・サイトマップには公開済みの版だけを使う
  token: import.meta.env.SANITY_READ_TOKEN,   // build 時のみ使用
});

// アーカイブとサイトマップで共有する、公開記事の軽量な一覧。
export const getPostSummaries = () =>
  client.fetch<PostSummary[]>(`*[_type=="post" && defined(slug.current)]{
    title, "slug": slug.current, publishedAt, _createdAt
  }|order(coalesce(publishedAt, _createdAt) desc)`);

export const getPosts = () =>
  client.fetch(`*[_type=="post" && defined(slug.current)]{
    _id, title, "slug": slug.current, description,
    mainImage{
      asset->{
        _id,
        url
      }
    }, 
    body[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url
        }
      }
    }, 
    publishedAt, _createdAt, _updatedAt
  }|order(coalesce(publishedAt, _createdAt) desc)`);

export const getPost = (slug: string) =>
  client.fetch(`*[_type=="post" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, description,
    mainImage{
      asset->{
        _id,
        url
      }
    }, 
    body[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url
        }
      }
    }, 
    publishedAt, _createdAt, _updatedAt
  }`, { slug });
