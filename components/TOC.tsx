'use client'

import React, { useEffect, useState } from 'react'
import slugify from 'slugify'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TOCProps {
  className?: string
}

const TOC: React.FC<TOCProps> = ({ className = '' }) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // ページ内の見出しを取得してTOCを生成
  useEffect(() => {
    const headings = document.querySelectorAll('[data-heading="2"]')
    const items: TOCItem[] = Array.from(headings).map((heading) => {
      const text = heading.textContent || ''
      // 日本語対応のslug生成
      const id = slugify(text, { lower: true, strict: true }) || 
                text.replace(/[^\w\s]/g, '').replace(/\s+/g, '-').toLowerCase() ||
                `heading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // IDが設定されていない場合は設定
      if (!heading.id) {
        heading.id = id
      }
      
      return {
        id,
        text,
        level: 2
      }
    })
    
    setTocItems(items)
  }, [])

  // IntersectionObserver でアクティブな見出しを追跡
  useEffect(() => {
    if (tocItems.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id
          if (entry.isIntersecting) {
            // ビューポートに入った見出しにactive属性を設定
            entry.target.setAttribute('data-active', 'true')
            setActiveId(id)
          } else {
            // ビューポートから出た見出しのactive属性を削除
            entry.target.removeAttribute('data-active')
          }
        })
      },
      {
        rootMargin: '-20% 0px -70% 0px', // 見出しが画面上部20%の位置でアクティブになる
        threshold: 0
      }
    )

    // 各見出し要素を観測対象に追加
    tocItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [tocItems])

  // 見出しが存在しない場合は何も表示しない
  if (tocItems.length === 0) return null

  return (
    <nav className={`sticky top-24 ${className}`} aria-label="目次">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">目次</h3>
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block text-sm leading-relaxed transition-colors duration-200 hover:text-indigo-600 ${
                  activeId === item.id
                    ? 'text-indigo-600 font-semibold'
                    : 'text-gray-600'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById(item.id)
                  if (element) {
                    element.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default TOC