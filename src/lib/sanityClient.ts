import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset:   import.meta.env.SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION,
  useCdn: false, // キャッシュを無効化して最新データを取得
  token: import.meta.env.SANITY_READ_TOKEN,   // build 時のみ使用
});

// 注意: ビルドには書き込み可能なトークンを使うため、フィルタしないと下書き（drafts.*）まで
// 本番サイトに出てしまう。一覧・詳細の両方で必ず drafts を除外すること。
export const getPosts = () =>
  client.fetch(`*[_type=="post" && defined(slug.current) && !(_id in path("drafts.**"))]{
    _id, title, "slug": slug.current, 
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
    publishedAt, _createdAt
  }|order(coalesce(publishedAt, _createdAt) desc)`);

export const getPost = (slug: string) =>
  client.fetch(`*[_type=="post" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    _id, title, "slug": slug.current, 
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
    publishedAt, _createdAt
  }`, { slug });