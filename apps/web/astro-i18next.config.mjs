import { URL, fileURLToPath } from 'node:url';

const resourcesBasePath = fileURLToPath(new URL('../../packages/locales', import.meta.url));

// eslint-disable-next-line tsdoc/syntax
/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: 'en-US',
  locales: ['en-US'],
  resourcesBasePath: '../../../packages/locales',
  i18nextServer: {
    supportedLngs: ['en-US'],
    // debug: true,
  },
};
