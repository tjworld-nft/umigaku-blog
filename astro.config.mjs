// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // これが無いと Astro.url が http://localhost:4321 のままビルドされ、
  // og:url / twitter:url / canonical が全部localhostになる
  site: 'https://miura-diving.com',
  base: '/blog',
  build: {
    // CSSは1枚（十数KB）なので、別ファイルにせずHTMLに入れる。
    // 記事は検索から1ページだけ読まれることが多く、最初の表示を止める通信を1つ減らせる。
    inlineStylesheets: 'always',
  },
});
