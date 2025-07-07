import React from 'react'
import { PortableText as SanityPortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

// TypeScript types for Sanity Portable Text
interface PortableTextProps {
  value: PortableTextBlock[]
  className?: string
}

interface HeadingProps {
  children: React.ReactNode
  level: 2 | 3
  className?: string
}

// Custom Heading component with slugified IDs for table of contents
const Heading: React.FC<HeadingProps> = ({ children, level, className = '' }) => {
  // Extract text content for slug generation
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(getTextContent).join('')
    if (React.isValidElement(node) && node.props.children) {
      return getTextContent(node.props.children)
    }
    return ''
  }

  // Generate slug from text content
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const textContent = getTextContent(children)
  const slug = generateSlug(textContent)

  const baseClasses = 'font-bold scroll-mt-20 relative'
  const levelClasses = {
    2: 'text-3xl lg:text-4xl mt-16 mb-8 text-blue-900 border-l-8 border-blue-500 pl-6 py-4 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg shadow-lg hover:shadow-xl transition-shadow duration-300',
    3: 'text-2xl lg:text-3xl mt-12 mb-6 text-blue-800 border-l-6 border-blue-400 pl-5 py-3 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-md shadow-md hover:shadow-lg transition-shadow duration-300'
  }

  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const finalClassName = `${baseClasses} ${levelClasses[level]} ${className}`

  const icons = {
    2: '📚', // Book emoji for main sections
    3: '💡'  // Bulb emoji for subsections
  }

  return (
    <Tag id={slug} className={finalClassName}>
      <span className="inline-flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">{icons[level]}</span>
        <span>{children}</span>
      </span>
    </Tag>
  )
}

// Function to merge dangling quote paragraphs and remove line break noise
const mergeDanglingQuoteParagraphs = (blocks: PortableTextBlock[]): PortableTextBlock[] => {
  if (!blocks || blocks.length === 0) return blocks

  // First pass: identify and fix problematic patterns across ALL blocks
  const allTextBlocks = blocks.filter(block => block._type === 'block' && block.style === 'normal')
  
  // Extract all text content to analyze patterns
  const fullText = allTextBlocks.map(block => 
    block.children?.map((child: any) => child.text || '').join('') || ''
  ).join('\n')

  const processedBlocks: PortableTextBlock[] = []

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i]

    // Skip non-text blocks
    if (currentBlock._type !== 'block' || currentBlock.style !== 'normal') {
      processedBlocks.push(currentBlock)
      continue
    }

    // Get current block text
    const currentText = currentBlock.children?.map((child: any) => child.text || '').join('') || ''
    
    // Ultra-aggressive merging conditions
    const shouldMerge = 
      // Block starts with closing punctuation
      /^[\s\n]*[」！？。、』]/.test(currentText) ||
      // Block is very short and contains closing punctuation  
      (currentText.trim().length <= 10 && /[」！？。]/.test(currentText)) ||
      // Block contains only punctuation and whitespace
      /^[\s\n」！？。、』]*$/.test(currentText) ||
      // Previous block ended with quote/exclamation without proper closing
      (processedBlocks.length > 0 && (() => {
        const prevText = processedBlocks[processedBlocks.length - 1].children?.map((child: any) => child.text || '').join('') || ''
        return /[「『][^」』]*[！？][\s\n]*$/.test(prevText) && /^[\s\n]*」/.test(currentText)
      })())

    if (shouldMerge && processedBlocks.length > 0) {
      const lastBlockIndex = processedBlocks.length - 1
      const lastBlock = processedBlocks[lastBlockIndex]
      
      if (lastBlock._type === 'block' && lastBlock.style === 'normal') {
        // Clean the current text thoroughly
        const cleanText = currentText
          .replace(/^[\s\n]+/, '') // Remove leading whitespace/newlines
          .replace(/[\s\n]+$/, '') // Remove trailing whitespace/newlines
        
        // Create a new text node with cleaned content
        const newTextNode = {
          _type: 'span',
          text: cleanText,
          marks: []
        }

        // Merge by adding to the last block's children
        processedBlocks[lastBlockIndex] = {
          ...lastBlock,
          children: [
            ...(lastBlock.children || []),
            newTextNode
          ]
        }
        
        continue
      }
    }

    // If not merging, clean the current block thoroughly
    const cleanedBlock = {
      ...currentBlock,
      children: currentBlock.children?.map((child: any) => {
        if (child.text) {
          return {
            ...child,
            text: child.text
              // Remove all problematic line break patterns
              .replace(/([！？])\s*\n+\s*」/g, '$1」') // Fix "楽しい！\n」"
              .replace(/([^！？。])\s*\n+\s*」/g, '$1」') // Fix any text + newline + 」
              .replace(/\s*\n+\s*([」！？。、])/g, '$1') // Remove newlines before punctuation
              .replace(/(\r\n|\r|\n){2,}/g, '\n') // Reduce multiple newlines
          }
        }
        return child
      }) || []
    }

    processedBlocks.push(cleanedBlock)
  }

  return processedBlocks
}

// Custom components for Portable Text rendering
const components = {
  block: {
    h2: ({ children }: { children: React.ReactNode }) => (
      <Heading level={2}>{children}</Heading>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <Heading level={3}>{children}</Heading>
    ),
    normal: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-6 text-lg leading-relaxed text-gray-800 whitespace-pre-line">
        {children}
      </p>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-500 pl-6 py-4 my-8 bg-blue-50 italic text-gray-700 rounded-r-lg">
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
        className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }
}

// Main PortableText component
const PortableText: React.FC<PortableTextProps> = ({ value, className = '' }) => {
  // Process blocks to merge dangling quotes and clean up noise
  const processedBlocks = mergeDanglingQuoteParagraphs(value)

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <SanityPortableText 
        value={processedBlocks} 
        components={components}
      />
    </div>
  )
}

export default PortableText