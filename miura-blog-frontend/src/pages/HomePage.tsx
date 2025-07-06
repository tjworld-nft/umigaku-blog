import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPosts } from '../lib/sanityClient'
import { Post } from '../types/Post'
import PostCard from '../components/PostCard'
import Layout from '../components/Layout'
import StructuredData from '../components/StructuredData'

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts()
        setPosts(data)
      } catch (err) {
        setError('記事の取得に失敗しました')
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Helmet>
        <title>三浦 海の学校のブログ - 最新記事</title>
        <meta name="description" content="三浦 海の学校のブログの最新記事をご覧ください。ダイビング、マリンアクティビティの情報を発信しています。" />
        <meta property="og:title" content="三浦 海の学校のブログ - 最新記事" />
        <meta property="og:description" content="三浦 海の学校のブログの最新記事をご覧ください。ダイビング、マリンアクティビティの情報を発信しています。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <StructuredData
        type="website"
        title="三浦 海の学校のブログ"
        description="ダイビング、マリンアクティビティの最新情報をお届けする三浦 海の学校のブログです。"
      />

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">まだ記事がありません</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">最新記事</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}

export default HomePage