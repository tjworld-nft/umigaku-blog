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
  
  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i]

    // Pass through non-paragraph blocks as-is
    if (currentBlock._type !== 'block' || !currentBlock.style || currentBlock.style === 'h1' || currentBlock.style === 'h2' || currentBlock.style === 'h3' || currentBlock.style === 'h4' || currentBlock.style === 'h5' || currentBlock.style === 'h6') {
      result.push(currentBlock)
      continue
    }

    // Get text content
    const getText = (block: any) => 
      block.children?.map((child: any) => child.text || '').join('') || ''

    const currentText = getText(currentBlock).trim()

    // Check if this block should be merged with the previous one
    const shouldMergeWithPrevious = result.length > 0 && 
      result[result.length - 1]._type === 'block' && 
      result[result.length - 1].style === 'normal' && (
        // Block starts with closing punctuation
        /^[」！？。、』]/.test(currentText) ||
        // Block contains only punctuation/whitespace
        /^[」！？。、』\s]*$/.test(currentText) ||
        // Very short block with punctuation
        (currentText.length <= 5 && /[」！？。]/.test(currentText)) ||
        // Single punctuation
        ['」', '！', '？', '。', '、'].includes(currentText)
      )

    if (shouldMergeWithPrevious) {
      // Merge with previous block
      const prevBlock = result[result.length - 1]
      const cleanedText = currentText.replace(/^\s+/, '').replace(/\s+$/, '')
      
      if (cleanedText) {
        result[result.length - 1] = {
          ...prevBlock,
          children: [
            ...(prevBlock.children || []),
            {
              _type: 'span',
              text: cleanedText,
              marks: []
            }
          ]
        }
      }
    } else {
      // Clean the block and add it
      const cleanedBlock = {
        ...currentBlock,
        children: currentBlock.children?.map((child: any) => {
          if (child.text) {
            return {
              ...child,
              text: child.text
                // Remove line breaks before punctuation
                .replace(/\s*\n+\s*([」！？。、])/g, '$1')
                // Clean up excessive whitespace
                .replace(/\s{2,}/g, ' ')
            }
          }
          return child
        }) || []
      }
      
      result.push(cleanedBlock)
    }
  }

  return result
}

// Custom components for Portable Text rendering
const components = {
  block: {
    // Handle different heading styles
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-16 mb-12">
        {children}
      </h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <Heading level={2}>{children}</Heading>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <Heading level={3}>{children}</Heading>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        {children}
      </h4>
    ),
    normal: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-6 text-lg leading-relaxed text-gray-800">
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
  // Debug: Log first few blocks to understand structure
  if (value && value.length > 0) {
    console.log('Sanity blocks structure:', value.slice(0, 5).map(block => ({
      _type: block._type,
      style: (block as any).style,
      text: (block as any).children?.map((child: any) => child.text).join('') || 'no text'
    })))
  }

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