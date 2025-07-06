// SEO自動生成ユーティリティ

export interface SEOData {
  metaDescription: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
}

// ダイビング関連キーワード辞書
const DIVING_KEYWORDS = [
  'ダイビング', 'スキューバ', 'スクーバ', '潜水', '海中',
  '海況', '水温', '透明度', '流れ', 'うねり',
  'ライセンス', '講習', 'Cカード', 'PADI', 'NAUI',
  '器材', 'レギュレーター', 'BCD', 'ウェットスーツ', 'ドライスーツ',
  '魚', '海洋生物', 'サンゴ', 'ウミガメ', '写真', '撮影',
  '三浦', '城ヶ島', '油壺', '長井', '久里浜', '湘南', '相模湾',
  '体験', 'ファンダイビング', 'ツアー', '初心者', '安全'
]

// 地域キーワード
const LOCATION_KEYWORDS = [
  '三浦半島', '神奈川', '関東', '東京近郊', '日帰り'
]

/**
 * テキストから自動でメタディスクリプションを生成
 */
export function generateMetaDescription(title: string, body: any[]): string {
  // タイトルをベースに開始
  let description = title

  // 本文から最初の段落を抽出
  if (body && body.length > 0) {
    const firstParagraph = extractTextFromPortableText(body)
    if (firstParagraph) {
      description = firstParagraph.substring(0, 120) + '...'
    }
  }

  // 末尾に定型文を追加
  if (!description.includes('三浦海の学校')) {
    description += ' | 三浦海の学校のダイビングブログ'
  }

  return description.substring(0, 160) // Google推奨の160文字以内
}

/**
 * タイトルと本文から関連キーワードを自動抽出
 */
export function generateKeywords(title: string, body: any[]): string[] {
  const allText = title + ' ' + extractTextFromPortableText(body)
  const keywords: string[] = []

  // ダイビング関連キーワードをチェック
  DIVING_KEYWORDS.forEach(keyword => {
    if (allText.includes(keyword) && !keywords.includes(keyword)) {
      keywords.push(keyword)
    }
  })

  // 地域キーワードをチェック
  LOCATION_KEYWORDS.forEach(keyword => {
    if (allText.includes(keyword) && !keywords.includes(keyword)) {
      keywords.push(keyword)
    }
  })

  // 水温、深度などの数値情報を抽出
  const temperatureMatch = allText.match(/(\d{1,2})度/)
  if (temperatureMatch) {
    keywords.push('水温' + temperatureMatch[1] + '度')
  }

  // 月・季節情報を抽出
  const monthKeywords = ['春', '夏', '秋', '冬', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  monthKeywords.forEach(month => {
    if (allText.includes(month) && !keywords.includes(month)) {
      keywords.push(month)
    }
  })

  // 上位10個のキーワードを返す
  return keywords.slice(0, 10)
}

/**
 * OGタイトルを生成（SNS用）
 */
export function generateOGTitle(title: string): string {
  if (title.includes('三浦海の学校')) {
    return title
  }
  return `${title} | 三浦海の学校`
}

/**
 * OG説明文を生成（SNS用）
 */
export function generateOGDescription(title: string, body: any[]): string {
  const description = generateMetaDescription(title, body)
  return description.replace(' | 三浦海の学校のダイビングブログ', '')
}

/**
 * PortableTextから純粋なテキストを抽出
 */
function extractTextFromPortableText(body: any[]): string {
  if (!body || !Array.isArray(body)) return ''
  
  let text = ''
  
  body.forEach(block => {
    if (block._type === 'block' && block.children) {
      block.children.forEach((child: any) => {
        if (child._type === 'span' && child.text) {
          text += child.text + ' '
        }
      })
    }
  })
  
  return text.trim()
}

/**
 * 記事から完全なSEOデータを生成
 */
export function generateSEOData(title: string, body: any[]): SEOData {
  return {
    metaDescription: generateMetaDescription(title, body),
    keywords: generateKeywords(title, body),
    ogTitle: generateOGTitle(title),
    ogDescription: generateOGDescription(title, body)
  }
}