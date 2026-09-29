import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages: https://tosharelater.github.io/nautila/
  site: 'https://tosharelater.github.io',
  base: '/nautila/',
  output: 'static',
  compressHTML: true,
});
