// 301 の転送先と転送ルールは本体サイト側で管理する。ここではブログ内のリンク元だけを制御する。
export const REDIRECTED = new Set<string>([
  // 東京から近いダイビング案内は本体の集客ページへ統合。
  'tokyo-kara-chikai-diving-2026-04-10',
  // 神奈川の体験とライセンスの比較は本体の案内へ統合。
  'kanagawa-taiken-diving-vs-license-2026-04-07',
  // 神奈川の初心者向け総合案内は本体の案内へ統合。
  'kanagawa-diving-beginner-guide-2026-04-06',
  // 三浦の体験ダイビング案内は本体の体験ページへ統合。
  'miura-trial-diving-guide-2026-04-05',
  // 三浦の初心者向け総合案内は本体の案内へ統合。
  'miura-diving-beginner-guide-2026-04-04',
  // GWの三浦の海遊び案内は本体のアクティビティ案内へ統合。
  'gw-miura-sea-activities-kanagawa-2026-04-03',
  // 春のダイビング開始案内は本体の初心者向け案内へ統合。
  'start-diving-spring-april-kanagawa-2026-04-01',
  // 日付だけの旧記事は本体側の対応ページへ統合。
  '2026-03-24',
  // PADIライセンス案内は本体のライセンスページへ統合。
  'padi-license-miura-umi-no-gakkou',
  // 三浦のライセンス案内は本体のライセンスページへ統合。
  'miura-diving-license',
  // プール講習の利点は本体の講習案内へ統合。
  'diving-school-pool-merit',
  // OWDライセンス案内は本体のライセンスページへ統合。
  'owd-license',
  // プール付きライセンス案内は本体の講習案内へ統合。
  'miura-diving-license-with-pool',
  // 対象者別のスクール案内は本体のスクールページへ統合。
  'miura-diving-school-for-everyone',
  // 初心者向けスクール案内は本体のスクールページへ統合。
  'miura-diving-school-for-beginners',
  // スクール選びの案内は本体のスクールページへ統合。
  'how-to-choose-diving-school',
  // 旧ブログ更新告知は本体側の対応ページへ統合。
  'blog-update',
  // ブランクダイバー向け案内は本体の関連ページへ統合。
  'miura-diving-beginner-blank',
  // 三浦の潜水ポイント案内は本体のポイントページへ統合。
  'miura-diving-points-guide-2026-04-05',
])

export const NOINDEX = new Set<string>([
  // 海の音楽の話題はダイビング案内から外れる。
  'miura-diving-sea-music-uo-uta-2026-07-30',
  // 個別のダイビング報告は検索向けの案内ではない。
  'miura-diving-report-2026-04-11',
  // 過去のGW告知は現在の受付案内ではない。
  'miura-diving-school-gw-2026-04-06',
  // プール清掃と春の準備の記録は検索向けの案内ではない。
  'diving-pool-cleaning-spring-preparation-miura-2026-04-02',
  // SUPの受付停止中につき、体験記を検索対象から外す。
  'miura-sup-snorkeling-repeater-day',
  // SUPの受付停止中につき、親子体験記を検索対象から外す。
  'miura-sup-oyako-adventure-20250829',
  // カヤックの受付停止中につき、家族ツアー記録を検索対象から外す。
  'seakayak-snorkeling-family-tour-20250823',
  // 過去の休業告知は現在の営業案内ではない。
  'miura-diving-closed-20250810',
  // AIスキルの話題はダイビング案内から外れる。
  'diving-and-ai-skill',
  // SUPの受付停止中につき、遊び場案内を検索対象から外す。
  'miura-umi-no-asobiba-snorkeling-sup',
  // 3D迷路ゲームの話題はダイビング案内から外れる。
  'diving-navigation-3d-maze-game',
  // 記憶ゲームの話題はダイビング案内から外れる。
  'umi-no-gakkou-memory-game-brain-training',
  // ダイビングゲームの告知は検索向けの案内ではない。
  'umi-no-gakkou-diving-game-open',
  // AIへの新しい挑戦の話題はダイビング案内から外れる。
  'umi-no-gakkou-new-challenge-ai',
  // カヤックの受付停止中につき、カップル体験記を検索対象から外す。
  'miura-seakayak-couple-tour',
  // 日付だけの旧記事は検索向けの案内ではない。
  '2025-07-06',
])
