import React from 'react'
import { PortableText as SanityPortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import slugify from 'slugify'
import { cleanupBlocks } from '../utils/cleanupBlocks'

interface PortableTextProps {
  value: PortableTextBlock[]
  className?: string
}

interface CustomHeadingProps {
  children: React.ReactNode
  level: 2 | 3
}

// カスタム見出しコンポーネント
const CustomHeading: React.FC<CustomHeadingProps> = ({ children, level }) => {
  const textContent = React.Children.toArray(children).join('')
  // 日本語対応のslug生成
  const id = slugify(textContent, { lower: true, strict: true }) || 
            textContent.replace(/[^\w\s]/g, '').replace(/\s+/g, '-').toLowerCase() ||
            `heading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const styles = {
    2: 'text-2xl font-bold mb-8 relative scroll-mt-28',
    3: 'text-xl font-semibold mb-6 relative scroll-mt-28'
  }

  return (
    <Tag id={id} className={styles[level]} data-heading={level}>
      {children}
      <span 
        aria-hidden 
        className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-500 opacity-60 rounded-md" 
      />
    </Tag>
  )
}

// Portable Text コンポーネント設定

const components = {
  block: {
    h2: ({ children }: { children: React.ReactNode }) => (
      <CustomHeading level={2}>{children}</CustomHeading>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <CustomHeading level={3}>{children}</CustomHeading>
    ),
    normal: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-6 text-lg leading-relaxed text-gray-800">
        {children}
      </p>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-sky-400 pl-6 py-4 my-8 bg-sky-50 italic text-gray-700 rounded-r-lg">
        {children}
      </blockquote>
    )
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-6 space-y-2 text-lg text-gray-800">
        {children}
      </ul>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-6 space-y-2 text-lg text-gray-800">
        {children}
      </ol>
    )
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-2">{children}</li>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-2">{children}</li>
    )
  },
  marks: {
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic text-gray-700">{children}</em>
    ),
    link: ({ children, value }: { children: React.ReactNode; value: { href: string } }) => (
      <a
        href={value.href}
        className="text-sky-600 hover:text-sky-800 underline underline-offset-2 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }
}

const PortableText: React.FC<PortableTextProps> = ({ value, className = '' }) => {
  // ブロック整形処理
  const cleanedBlocks = cleanupBlocks(value)

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <SanityPortableText 
        value={cleanedBlocks} 
        components={components}
      />
    </div>
  )
}

export default PortableText