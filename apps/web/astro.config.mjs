import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), astroI18next()],
  prefetch: true,
  output: 'hybrid',
  adapter: cloudflare(),
  vite: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: '_redirects',
            dest: '',
          },
        ],
      }),
    ],
  },
});
