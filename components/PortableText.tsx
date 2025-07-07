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
    
    // More aggressive merging: check for quotes, punctuation, or very short blocks
    const startsWithQuote = currentText.trim().startsWith('」')
    const startsWithContinuation = /^[」！？。、]/.test(currentText.trim())
    const isVeryShort = currentText.trim().length <= 5 && /[」！？。]/.test(currentText)
    const hasOnlyPunctuation = /^[」！？。、\s]*$/.test(currentText.trim())
    
    // Check if previous block ended with potential continuation
    let shouldMergeWithPrevious = false
    if (processedBlocks.length > 0) {
      const lastBlock = processedBlocks[processedBlocks.length - 1]
      if (lastBlock._type === 'block' && lastBlock.style === 'normal') {
        const lastText = getBlockText(lastBlock)
        const endsWithOpenQuote = /[「『]/.test(lastText) && !lastText.includes('」') && !lastText.includes('』')
        const endsWithoutPunctuation = !/[。！？」』]$/.test(lastText.trim())
        
        shouldMergeWithPrevious = (startsWithQuote || startsWithContinuation || isVeryShort || hasOnlyPunctuation) ||
                                 (endsWithOpenQuote && currentText.includes('」')) ||
                                 (endsWithoutPunctuation && (startsWithQuote || isVeryShort))
      }
    }
    
    if (shouldMergeWithPrevious && processedBlocks.length > 0) {
      const lastBlock = processedBlocks[processedBlocks.length - 1]
      
      if (lastBlock._type === 'block' && lastBlock.style === 'normal') {
        // Clean up the current block's text before merging
        const cleanedCurrentChildren = (currentBlock.children || []).map((child: any) => ({
          ...child,
          text: child.text ? child.text.replace(/^\s+/, '').replace(/^\n+/, '') : child.text
        }))

        // Merge current block's children with the last block
        const mergedChildren = [
          ...(lastBlock.children || []),
          ...cleanedCurrentChildren
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
              // Remove line breaks and spaces before closing quotes
              .replace(/\s*\n+\s*」/g, '」')
              .replace(/\s+」/g, '」')
              // Remove line breaks and spaces before ending punctuation
              .replace(/\s*\n+\s*([！？。、])/g, '$1')
              // Remove excessive line breaks
              .replace(/(\r\n|\r|\n){3,}/g, '\n\n')
              // Clean up patterns like "楽しい！\n" + "」" 
              .replace(/([！？。])\s*\n+\s*」/g, '$1」')
              // Remove line breaks between sentences and closing quotes
              .replace(/([^。！？])\s*\n+\s*」/g, '$1」')
              // Handle quotes within the same text node
              .replace(/([「『][^」』]*)\s*\n+\s*([^」』]*」)/g, '$1$2')
              // Clean up standalone quotes or punctuation
              .replace(/^\s*([」！？。、])/g, '$1')
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

  // Final pass: merge any remaining isolated punctuation blocks
  const finalBlocks: PortableTextBlock[] = []
  
  for (let i = 0; i < processedBlocks.length; i++) {
    const block = processedBlocks[i]
    
    if (block._type === 'block' && block.style === 'normal') {
      const text = block.children?.map((child: any) => child.text || '').join('') || ''
      
      // If this block is just punctuation and we have a previous block, merge it
      if (/^[」！？。、\s]*$/.test(text.trim()) && finalBlocks.length > 0) {
        const lastBlock = finalBlocks[finalBlocks.length - 1]
        if (lastBlock._type === 'block' && lastBlock.style === 'normal') {
          finalBlocks[finalBlocks.length - 1] = {
            ...lastBlock,
            children: [
              ...(lastBlock.children || []),
              ...(block.children || [])
            ]
          }
          continue
        }
      }
    }
    
    finalBlocks.push(block)
  }
  
  return finalBlocks
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