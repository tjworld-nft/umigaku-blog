import type { PortableTextBlock } from '@portabletext/types'

/**
 * Portable Text ブロックの段落整形処理
 * 開閉カギ括弧や句読点単体のブロックを前後と結合する
 */
export function cleanupBlocks(blocks: PortableTextBlock[]): PortableTextBlock[] {
  if (!blocks || blocks.length === 0) return blocks

  const result: PortableTextBlock[] = []

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i]

    // 段落ブロック以外はそのまま通す
    if (currentBlock._type !== 'block' || currentBlock.style !== 'normal') {
      result.push(currentBlock)
      continue
    }

    // テキスト内容を取得
    const getText = (block: PortableTextBlock): string => {
      if (!block.children) return ''
      return block.children
        .map((child: any) => child.text || '')
        .join('')
        .trim()
    }

    const currentText = getText(currentBlock)

    // 開閉カギ括弧や句読点のみのブロックかチェック
    const isPunctuationOnly = /^["『「（"）】！？。、」』]*$/.test(currentText)
    
    // 前のブロックと結合すべきかチェック
    const shouldMerge = isPunctuationOnly && 
                       result.length > 0 && 
                       result[result.length - 1]._type === 'block' && 
                       result[result.length - 1].style === 'normal'

    if (shouldMerge) {
      // 前のブロックと結合
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
      // テキスト内の改行・空白を整形してブロックを追加
      const cleanedBlock = {
        ...currentBlock,
        children: currentBlock.children?.map((child: any) => {
          if (child.text) {
            return {
              ...child,
              text: child.text
                // 句読点前の改行・空白を除去
                .replace(/\s*\n+\s*([」！？。、』）】])/g, '$1')
                // 連続する空白を単一に
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