import React from 'react'
import { Helmet } from 'react-helmet-async'

interface StructuredDataProps {
  type: 'website' | 'article'
  title: string
  description: string
  url?: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: string
}

const StructuredData: React.FC<StructuredDataProps> = ({
  type,
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author = '三浦 海の学校'
}) => {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type === 'website' ? 'WebSite' : 'Article',
    name: title,
    description: description,
    url: url || window.location.href,
    publisher: {
      '@type': 'Organization',
      name: '三浦 海の学校',
      url: 'https://miura-diving.com'
    }
  }

  const articleData = type === 'article' ? {
    headline: title,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author
    }
  } : {}

  const structuredData = { ...baseData, ...articleData }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}

export default StructuredData