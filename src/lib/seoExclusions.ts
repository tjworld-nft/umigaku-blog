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

  // ---- 2026-10-12 追加（38本）----
  // 2025年の短い日記や、ほかの記事・本体ページと中身が重なる記事。Google も多くを登録していなかった
  // （Search Console の「クロール済み・未登録」）。URLは残し、全記事一覧からは読める。
  // 1本ずつの理由は、文章の診断（Fable・2026-10-11）の仕分けによる。
  // 「水温25度到達」の時点告知。「当校前のビーチ」「プール」は旧施設。季節の話は winter-diving／3beach
  'blog-2025-0706',
  // 「今7月に取るべき」の時点物。プール30℃・旧施設。中身は nissu-2days・winter 記事と重なる
  'go-diving-2025-7-7-25',
  // 生き物4種の短い紹介（1,676字）。図鑑 /sea-life/ と重なる
  'miura-diving-blog-summer-creatures',
  // PADIから賞賛メールが来た話。読者の検索意図が無い。残すなら /instructor/ の1行で足りる
  'miura-diving-customer-voice',
  // 前日の続き（「！」46）。統合先: 07-12 の記事に最終日を1節で足す
  'miura-diving-owd-certified-20250713',
  // 「！」41。スノーケリングの感想。SUP言及。/marine-activity/ と重なる
  'miura-snorkeling-report-hakofugu',
  // 旧施設「水深3.5m専用プール」「施設レンタル」の売り込み。現状と食い違うので noindex 必須（削除でもよい）
  'miura-diving-pool-merit',
  // 1,455字。天気と生き物の短い日記。プール32℃
  'miura-diving-report-20250726',
  // 元同僚との個人的な物語。「最高の」11
  'miura-fun-diving-ogasawara-20250727',
  // 1,995字の日記。AIサロン告知
  'padi-owd-course-20250803',
  // 1,587字。Jr.AOW。統合先: /advanced/ か junior-open-water（2026-08-03
  'padi-jr-aow-k-chan',
  // 1,329字
  'miura-kokeginpo-found-20250809',
  // 1,448字。「！」26
  'snorkeling-tour-gakudo-20250808',
  // 5コース同時の雑多な日記（「！」46）。2026-08-14 の記事と同じ内容
  'diving-session-report-20250814',
  // 講習2日目＋再会。統合先: 08-13
  'owd-course-day2-and-reunion-20250816',
  // 連載の最終日。統合先: 08-13
  'owd-final-day-report-20250815',
  // 彼氏がダイブマスター、という個人的な話
  'owd-final-day-y-san-with-bf-20250820',
  // 大学授業。統合先: 2026-09-01 の同テーマ記事
  'snorkeling-class-for-university-20250818',
  // 「！」33。/marine-activity/ と重なる
  'snorkeling-tour-k-san-20250822',
  // 1,248字。「VIP様」表現。h2が本文冒頭に重複
  'miura-diving-vip-owd-20250825',
  // ウミウシ＋AI談義＋AIサロン。1記事2テーマ。「北海道から」
  'miura-diving-repeater-ai-talk-20250826',
  // 「某著名タレントさんからのご紹介」。1,696字
  'miura-diving-owd-course-day2-pool',
  // 親子体験。2026-08-16 の記事と重なる
  'miura-diving-snorkeling-oyako-20250828',
  // 日記。「奇跡のイワシ大群」
  'miura-diving-august-final-owd-fundive-20250831',
  // 1,957字。「奇跡の再会」
  'miura-diving-junior-cebu-reunion-20250830',
  // 「セカンドハウスを購入」は個人情報。1,615字
  'miura-diving-owd-course-day1-y-san',
  // 1,481字。連載
  'miura-diving-owd-course-day2-challenge',
  // 連載最終日。LINE壊れ。統合: 3本を1本に
  'miura-diving-owd-final-day-y-san',
  // 1,758字。リフレッシュ記事は 2026-08-19 が本命
  'miura-diving-refresh-dive-t-kun',
  // 2,010字。日付が本文と食い違う（8月7日の話を9/11に）
  'miura-diving-reunion-owd-experience',
  // 「女性ダイバーたち」の個人的な再会
  'miura-diving-refresh-dive-girls-day',
  // 「マレーシア出身」。1,775字
  'miura-diving-owd-final-malaysia',
  // 「俳優さん・女優さん」。1,594字
  'miura-diving-owd-final-talent-team',
  // 1,696字。八兵衛丸のマグロ丼は良いが短い日記
  'miura-diving-boat-dive-maguro-don',
  // 1,935字。「最高の」9
  'miura-diving-aow-boat-seahorse',
  // 1,725字
  'miura-diving-aow-course-buddies',
  // 1,624字
  'miura-diving-aow-course-for-maldives',
  // 1,569字
  'miura-diving-aow-resort-buddy',
])
