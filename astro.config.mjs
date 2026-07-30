// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // これが無いと Astro.url が http://localhost:4321 のままビルドされ、
  // og:url / twitter:url / canonical が全部localhostになる
  site: 'https://miura-diving.com',
  base: '/blog',
  vite: {
    plugins: [tailwindcss()],
  },
});