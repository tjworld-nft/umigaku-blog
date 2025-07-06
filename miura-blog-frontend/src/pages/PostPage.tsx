import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { PortableText } from '@portabletext/react'
import { getPost } from '../lib/sanityClient'
import { Post } from '../types/Post'
import Layout from '../components/Layout'
import StructuredData from '../components/StructuredData'

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return

      try {
        const data = await getPost(slug)
        if (data) {
          setPost(data)
        } else {
          setError('記事が見つかりません')
        }
      } catch (err) {
        setError('記事の取得に失敗しました')
        console.error('Error fetching post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const components = {
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?._ref) {
          return null
        }
        
        const imageUrl = `https://cdn.sanity.io/images/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${value.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`
        
        return (
          <img
            src={imageUrl}
            alt={value.alt || ''}
            className="w-full h-auto rounded-lg my-4"
          />
        )
      }
    },
    block: {
      h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
      h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
      h3: ({ children }: any) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
      normal: ({ children }: any) => <p className="mb-4 leading-relaxed">{children}</p>,
    },
    marks: {
      link: ({ children, value }: any) => (
        <a href={value.href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    },
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || '記事が見つかりません'}</p>
            <Link to="/" className="text-blue-600 hover:underline">
              ホームに戻る
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Helmet>
        <title>{post.title} - 三浦 海の学校のブログ</title>
        <meta name="description" content={`${post.title}の記事です。三浦 海の学校のブログより`} />
        <meta property="og:title" content={`${post.title} - 三浦 海の学校のブログ`} />
        <meta property="og:description" content={`${post.title}の記事です。三浦 海の学校のブログより`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        {post.mainImage && (
          <>
            <meta property="og:image" content={`https://cdn.sanity.io/images/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${post.mainImage.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`} />
            <meta name="twitter:image" content={`https://cdn.sanity.io/images/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${post.mainImage.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`} />
          </>
        )}
      </Helmet>

      <StructuredData
        type="article"
        title={post.title}
        description={`${post.title}の記事です。三浦 海の学校のブログより`}
        datePublished={post.publishedAt || post._createdAt}
        dateModified={post._createdAt}
        image={post.mainImage ? `https://cdn.sanity.io/images/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${post.mainImage.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}` : undefined}
      />

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {post.mainImage && (
          <div className="aspect-video bg-gray-200">
            <img
              src={`https://cdn.sanity.io/images/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${post.mainImage.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-gray-600 text-sm mb-8">
            <time dateTime={post.publishedAt || post._createdAt}>
              {formatDate(post.publishedAt || post._createdAt)}
            </time>
          </div>

          <div className="prose prose-lg max-w-none">
            {post.body && (
              <PortableText
                value={post.body}
                components={components}
              />
            )}
          </div>
        </div>
      </article>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          記事一覧に戻る
        </Link>
      </div>
    </Layout>
  )
}

export default PostPage