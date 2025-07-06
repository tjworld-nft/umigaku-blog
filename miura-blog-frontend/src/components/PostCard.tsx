import React from 'react'
import { Link } from 'react-router-dom'
import { Post } from '../types/Post'

interface PostCardProps {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  return (
    <article className="w-full bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {post.mainImage && (
        <div className="aspect-video bg-gray-200">
          <img
            src={`https://cdn.sanity.io/images/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${post.mainImage.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`}
            alt={post.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 line-clamp-2">
          <Link
            to={`/post/${post.slug}`}
            className="text-gray-900 hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          {formatDate(post.publishedAt || post._createdAt)}
        </p>
        <Link
          to={`/post/${post.slug}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          続きを読む
        </Link>
      </div>
    </article>
  )
}

export default PostCard