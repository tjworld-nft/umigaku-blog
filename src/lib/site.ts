// サイト共通の決まった値。本体サイト（miura-diving.com）のヘッダー・フッターと同じ並びにしてある。
// 本体のメニューを変えたら、ここも合わせる（本体は別リポジトリなので自動では変わらない）。

export const SITE = 'https://miura-diving.com'
export const BLOG_PATH = '/blog/'
export const BLOG_URL = `${SITE}${BLOG_PATH}`
export const BRAND = '三浦 海の学校'
export const BLOG_NAME = '三浦 海の学校のブログ'
export const BLOG_DESCRIPTION =
  '神奈川・三浦半島のダイビングスクール「三浦 海の学校」のブログ。城ヶ島・宮川湾のその日の海、ライセンス講習の様子、はじめての方の疑問への答えを、インストラクターが現場から書いています。'

export const LINE_URL = 'https://lin.ee/kK3d5p2'

/** 一覧1ページあたりの本数 */
export const PER_PAGE = 12

export const AUTHOR = {
  name: '吉田 哲司',
  kana: 'よしだ てつじ',
  role: 'PADIコースディレクター',
  url: `${SITE}/instructor/`,
  id: `${SITE}/instructor/#person`,
}

/** ヘッダー（PC） */
export const NAV = [
  { label: '初心者ガイド', href: '/beginner-guide/' },
  { label: '体験ダイビング', href: '/trial-diving/' },
  { label: 'ライセンス取得', href: '/license/' },
  { label: 'ファンダイビング', href: '/fun-diving/' },
  { label: 'スノーケリング', href: '/marine-activity/' },
  { label: '海の生き物図鑑', href: '/sea-life/' },
  { label: 'ブログ', href: BLOG_PATH, current: true },
]

/** ヘッダー（スマホのメニュー） */
export const MOBILE_NAV = [
  { label: 'ホーム', href: '/' },
  { label: '初心者ガイド', href: '/beginner-guide/' },
  { label: '体験ダイビング', href: '/trial-diving/' },
  { label: 'ダイビングライセンス', href: '/license/' },
  { label: 'ファンダイビング・リフレッシュ', href: '/fun-diving/' },
  { label: 'スノーケリング', href: '/marine-activity/' },
  { label: '海の生き物図鑑', href: '/sea-life/' },
  { label: 'まんがで読むダイビング', href: '/manga/' },
  { label: 'インストラクター紹介', href: '/instructor/' },
  { label: 'ブログ', href: BLOG_PATH, current: true },
  { label: '予約・お問い合わせ', href: '/contact/' },
]

/** フッターのメニュー（本体と同じ順） */
export const FOOTER_NAV = [
  { label: '初心者ガイド', href: '/beginner-guide/' },
  { label: '体験ダイビング', href: '/trial-diving/' },
  { label: 'ダイビングライセンス', href: '/license/' },
  { label: 'アドバンス講習（AOW）', href: '/advanced/' },
  { label: 'スペシャルティ講習', href: '/specialty/' },
  { label: 'ファンダイビング', href: '/fun-diving/' },
  { label: 'リフレッシュダイビング', href: '/refresh/' },
  { label: 'スノーケリング', href: '/marine-activity/' },
  { label: '秋冬のダイビング', href: '/winter-diving/' },
  { label: '海の生き物図鑑', href: '/sea-life/' },
  { label: 'インストラクター紹介', href: '/instructor/' },
  { label: 'ブログ', href: BLOG_PATH },
  { label: 'まんがで読むダイビング', href: '/manga/' },
  { label: 'お友達紹介（バディ割）', href: '/buddy/' },
  { label: 'つづける割（次回¥800引き）', href: '/tsuzukeru/' },
  { label: '予約・お問い合わせ', href: '/contact/' },
  { label: '特定商取引法に基づく表記', href: '/tokusho/' },
  { label: 'プライバシーポリシー', href: '/privacy-policy/' },
]

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/tj_official_umigaku/', icon: 'ig' },
  { label: 'Facebook', href: 'https://www.facebook.com/miuraumigaku/', icon: 'fb' },
  { label: 'X', href: 'https://x.com/miura_diving', icon: 'x' },
]

export function formatDate(iso: string): string {
  // ビルド環境のタイムゾーンに左右されないよう、日本時間で固定する
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso))
}

/** 年ごとにまとめるための「2026」 */
export function yearOf(iso: string): string {
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric' }).format(new Date(iso)).replace('年', '')
}

/** 「2025年7月」の形 */
export function monthOf(iso: string): string {
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long' }).format(new Date(iso))
}
