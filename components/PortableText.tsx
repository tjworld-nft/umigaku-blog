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

  const result: PortableTextBlock[] = []
  let i = 0

  while (i < blocks.length) {
    const currentBlock = blocks[i]

    // Pass through non-text blocks
    if (currentBlock._type !== 'block' || currentBlock.style !== 'normal') {
      result.push(currentBlock)
      i++
      continue
    }

    // Get text content of current block
    const getCurrentText = (block: PortableTextBlock) => 
      block.children?.map((child: any) => child.text || '').join('').trim() || ''

    const currentText = getCurrentText(currentBlock)

    // Look ahead to find consecutive blocks that should be merged
    const blocksToMerge = [currentBlock]
    let j = i + 1

    while (j < blocks.length) {
      const nextBlock = blocks[j]
      
      if (nextBlock._type !== 'block' || nextBlock.style !== 'normal') {
        break
      }

      const nextText = getCurrentText(nextBlock)
      
      // Merge if next block:
      // 1. Starts with closing punctuation (」！？。)
      // 2. Contains only punctuation
      // 3. Is very short (likely a fragment)
      // 4. Continues a quote pattern
      const shouldMergeNext = 
        /^[」！？。、』]/.test(nextText) ||
        /^[」！？。、』\s]*$/.test(nextText) ||
        (nextText.length <= 3 && /[」！？。]/.test(nextText)) ||
        (nextText === '」') ||
        (nextText === '！' || nextText === '？' || nextText === '。')

      if (shouldMergeNext) {
        blocksToMerge.push(nextBlock)
        j++
      } else {
        break
      }
    }

    // If we have multiple blocks to merge, create a combined block
    if (blocksToMerge.length > 1) {
      const mergedChildren: any[] = []
      
      for (const block of blocksToMerge) {
        if (block.children) {
          for (const child of block.children) {
            if (child.text) {
              const cleanedText = child.text
                .replace(/^\s+/, '') // Remove leading spaces
                .replace(/\s+$/, '') // Remove trailing spaces
              
              if (cleanedText) {
                mergedChildren.push({
                  ...child,
                  text: cleanedText
                })
              }
            } else {
              mergedChildren.push(child)
            }
          }
        }
      }

      // Create the merged block
      const mergedBlock = {
        ...currentBlock,
        children: mergedChildren
      }

      result.push(mergedBlock)
      i = j // Skip all the merged blocks
    } else {
      // No merging needed, just clean the current block
      const cleanedBlock = {
        ...currentBlock,
        children: currentBlock.children?.map((child: any) => {
          if (child.text) {
            return {
              ...child,
              text: child.text
                .replace(/([！？])\s*」/g, '$1」')
                .replace(/([^！？。])\s*」/g, '$1」')
            }
          }
          return child
        }) || []
      }
      
      result.push(cleanedBlock)
      i++
    }
  }

  return result
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