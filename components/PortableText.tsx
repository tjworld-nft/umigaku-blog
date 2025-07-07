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

  const baseClasses = 'font-bold text-gray-900 scroll-mt-20'
  const levelClasses = {
    2: 'text-2xl lg:text-3xl mt-12 mb-6 border-t-2 border-gray-200 pt-8',
    3: 'text-xl lg:text-2xl mt-10 mb-4'
  }

  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const finalClassName = `${baseClasses} ${levelClasses[level]} ${className}`

  return (
    <Tag id={slug} className={finalClassName}>
      {children}
    </Tag>
  )
}

// Function to merge dangling quote paragraphs and remove line break noise
const mergeDanglingQuoteParagraphs = (blocks: PortableTextBlock[]): PortableTextBlock[] => {
  const processedBlocks: PortableTextBlock[] = []

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i]

    // Only process paragraph blocks
    if (currentBlock._type !== 'block' || currentBlock.style !== 'normal') {
      processedBlocks.push(currentBlock)
      continue
    }

    // Get text content from children
    const getBlockText = (block: PortableTextBlock): string => {
      if (!block.children) return ''
      return block.children
        .map((child: any) => child.text || '')
        .join('')
    }

    const currentText = getBlockText(currentBlock)
    
    // Check if current block starts with closing quote and merge with previous
    if (currentText.trim().startsWith('」') && processedBlocks.length > 0) {
      const lastBlock = processedBlocks[processedBlocks.length - 1]
      
      if (lastBlock._type === 'block' && lastBlock.style === 'normal') {
        // Merge current block's children with the last block
        const mergedChildren = [
          ...(lastBlock.children || []),
          ...((currentBlock.children || []).map((child: any) => ({
            ...child,
            text: child.text ? child.text.replace(/^\s+/, '') : child.text // Remove leading whitespace
          })))
        ]

        // Update the last block with merged content
        processedBlocks[processedBlocks.length - 1] = {
          ...lastBlock,
          children: mergedChildren
        }
        continue
      }
    }

    // Clean up line break noise in current block
    if (currentBlock.children) {
      const cleanedChildren = currentBlock.children.map((child: any) => {
        if (child.text) {
          return {
            ...child,
            text: child.text
              .replace(/\n\s*」/g, '」') // Remove line breaks before closing quotes
              .replace(/(\r\n|\r|\n){3,}/g, '\n\n') // Reduce multiple line breaks to double
              .replace(/\s+」/g, '」') // Remove spaces before closing quotes
          }
        }
        return child
      })

      processedBlocks.push({
        ...currentBlock,
        children: cleanedChildren
      })
    } else {
      processedBlocks.push(currentBlock)
    }
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