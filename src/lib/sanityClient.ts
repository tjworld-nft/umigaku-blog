import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset:   import.meta.env.SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION,
  useCdn: false, // キャッシュを無効化して最新データを取得
  token: import.meta.env.SANITY_READ_TOKEN,   // build 時のみ使用
});

// 下書き（drafts.*）の除外。apiVersion 2025-02-19 以降は既定の perspective が `published` に
// なったため現状これが無くても drafts は入らないが、apiVersion を下げる（2025-02-19 未満は
// 既定が `raw`）か perspective を明示すると途端に下書きが本番へ出る。安全側に倒して明示する。
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