// 自動タグ付けユーティリティ
interface TagRule {
  tag: string
  keywords: string[]
  color: string
}

// ダイビング関連の自動タグ検出ルール
export const tagRules: TagRule[] = [
  // メインカテゴリ
  {
    tag: 'ライセンス講習',
    keywords: ['ライセンス', 'OWD', 'AOW', 'オープンウォーター', 'アドバンス', '講習', 'PADI', 'スペシャルティ', 'Cカード', '認定', '資格'],
    color: '#3B82F6' // blue
  },
  {
    tag: 'ファンダイビング', 
    keywords: ['ファンダイビング', 'ツアー', 'ガイド', '探検', '魚', 'ウミウシ', 'サンゴ', '水中ツアー', '海中散歩'],
    color: '#10B981' // emerald
  },
  {
    tag: '初心者向け',
    keywords: ['初心者', 'はじめて', '不安', '体験', '初回', '基本', '入門', '初級', 'ビギナー', '安心'],
    color: '#F59E0B' // amber
  },
  {
    tag: '海況・コンディション',
    keywords: ['水温', '透明度', '波', 'うねり', '流れ', '海況', 'コンディション', '天気', '風', '気温'],
    color: '#06B6D4' // cyan
  },
  {
    tag: '器材・装備',
    keywords: ['ウェットスーツ', 'ドライスーツ', 'BCD', 'マスク', 'フィン', 'レギュレーター', '器材', '装備', 'タンク', 'ウェイト'],
    color: '#8B5CF6' // violet
  },
  {
    tag: 'ビーチ情報',
    keywords: ['三浦', '城ヶ島', '油壺', 'ビーチ', 'エントリー', 'エキジット', 'ポイント', '海岸', '磯'],
    color: '#EC4899' // pink
  },
  {
    tag: '水中撮影',
    keywords: ['撮影', '写真', 'カメラ', '動画', 'フォト', 'マクロ', 'ワイド', '映像', 'ムービー'],
    color: '#EF4444' // red
  },
  
  // サブカテゴリ
  {
    tag: 'プール講習',
    keywords: ['プール', '練習', 'スキル', '基礎', '限定水域', '安全', '温水'],
    color: '#14B8A6' // teal
  },
  {
    tag: '安全管理',
    keywords: ['安全', 'AED', '救急', '緊急', '応急処置', '事故', '予防', 'セーフティ'],
    color: '#DC2626' // red-600
  },
  {
    tag: 'eラーニング',
    keywords: ['eラーニング', 'オンライン', '学習', '勉強', '理論', '知識', 'テスト'],
    color: '#7C3AED' // purple
  },
  {
    tag: '季節情報',
    keywords: ['夏', '冬', '春', '秋', 'シーズン', '季節', '梅雨', 'ベストシーズン'],
    color: '#059669' // emerald-600
  },
  {
    tag: 'よくある質問',
    keywords: ['質問', 'FAQ', '疑問', '不安', '心配', '相談', 'Q&A', 'よくある'],
    color: '#7C2D12' // orange-800
  }
]

/**
 * テキスト内容からタグを自動検出
 */
export function detectTags(title: string, bodyText: string): string[] {
  const fullText = `${title} ${bodyText}`.toLowerCase()
  const detectedTags: string[] = []

  for (const rule of tagRules) {
    // キーワードマッチング（部分一致）
    const hasKeyword = rule.keywords.some(keyword => 
      fullText.includes(keyword.toLowerCase())
    )
    
    if (hasKeyword) {
      detectedTags.push(rule.tag)
    }
  }

  // 重複削除とソート
  return [...new Set(detectedTags)].sort()
}

/**
 * Portable Text から平文テキストを抽出
 */
export function extractTextFromPortableText(blocks: any[]): string {
  if (!blocks) return ''
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (!block.children) return ''
      return block.children
        .filter((child: any) => child._type === 'span')
        .map((child: any) => child.text || '')
        .join('')
    })
    .join(' ')
}

/**
 * タグの色を取得
 */
export function getTagColor(tagName: string): string {
  const rule = tagRules.find(rule => rule.tag === tagName)
  return rule?.color || '#6B7280' // default gray
}

/**
 * 人気タグの取得（記事数でソート）
 */
export function getPopularTags(posts: any[]): Array<{tag: string, count: number, color: string}> {
  const tagCounts = new Map<string, number>()
  
  // 全記事のタグをカウント
  posts.forEach(post => {
    if (post.autoTags) {
      post.autoTags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    }
  })

  // カウント順でソートして返す
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      color: getTagColor(tag)
    }))
    .sort((a, b) => b.count - a.count)
}

export default {
  detectTags,
  extractTextFromPortableText,
  getTagColor,
  getPopularTags,
  tagRules
}