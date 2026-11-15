import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loveConfig } from './src/config/loveConfig.ts';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'love-config-metadata',
    transformIndexHtml(html) {
      const replacements: Record<string, string> = { TITLE: loveConfig.title, DESCRIPTION: loveConfig.seo.description, SHARE_TITLE: loveConfig.seo.shareTitle, SHARE_DESCRIPTION: loveConfig.seo.shareDescription, THEME: loveConfig.palette.background };
      return html.replace(/__LOVE_(\w+)__/g, (_, key: string) => escapeHtml(replacements[key] ?? ''));
    },
  }],
  // Relative assets work at both / and /repository-name/ without a router.
  base: './',
});
