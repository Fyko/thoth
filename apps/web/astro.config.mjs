import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';
import replace from 'vite-plugin-filter-replace';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const custom = {
  name: 'CustomThothIntegration',
  hooks: {
    'astro:config:setup': ({ updateConfig }) => {
      updateConfig({
        vite: {
          plugins: [
            replace.default([
              {
                filter: /\.js$/,
                replace: {
                  from: /https:\/\/cdn.skyra.pw\/whitney-font\/v2\//g,
                  to: '/assets/fonts/',
                },
              },
            ]),
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
    },
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [react(), astroI18next(), custom],
  prefetch: true,
  output: 'hybrid',
  adapter: cloudflare(),
});
