// 読了時間を計算するユーティリティ関数

/**
 * テキストの読了時間を計算
 * @param text - 計算対象のテキスト
 * @param wordsPerMinute - 1分間に読める文字数（日本語の平均: 400-600文字）
 * @returns 読了時間（分）
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 500): number {
  if (!text) return 0;
  
  // HTMLタグを除去
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // 文字数をカウント（空白も含む）
  const characterCount = cleanText.length;
  
  // 読了時間を計算（分）
  const readingTimeMinutes = Math.ceil(characterCount / wordsPerMinute);
  
  // 最低1分とする
  return Math.max(1, readingTimeMinutes);
}

/**
 * 読了時間を日本語の表示用文字列に変換
 * @param minutes - 読了時間（分）
 * @returns 表示用文字列
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '約1分で読めます';
  }
  return `約${minutes}分で読めます`;
}

/**
 * Portable Textから読了時間を計算
 * @param portableText - Sanity Portable Text配列
 * @param wordsPerMinute - 1分間に読める文字数
 * @returns 読了時間（分）
 */
export function calculateReadingTimeFromPortableText(portableText: any[], wordsPerMinute: number = 500): number {
  if (!portableText || portableText.length === 0) return 1;
  
  let totalText = '';
  
  // Portable Textから全テキストを抽出
  function extractText(blocks: any[]): string {
    return blocks.map(block => {
      if (block._type === 'block' && block.children) {
        return block.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join('\n');
  }
  
  totalText = extractText(portableText);
  
  return calculateReadingTime(totalText, wordsPerMinute);
}