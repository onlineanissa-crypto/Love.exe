import { readFile, writeFile, copyFile } from 'node:fs/promises';

// Actions provides the true URL, so WhatsApp and social crawlers receive absolute metadata.
const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
let html = await readFile('dist/index.html', 'utf8');
if (siteUrl) {
  const url = new URL(siteUrl);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('SITE_URL must be an HTTP URL');
  const safe = siteUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  html = html.replaceAll('content="./og-image.jpg"', `content="${safe}/og-image.jpg"`);
  html = html.replace('</head>', `  <link rel="canonical" href="${safe}/" />\n    <meta property="og:url" content="${safe}/" />\n  </head>`);
}
await writeFile('dist/index.html', html);
// No pathname routing: all chapters live at the project root, so refresh always works.
await copyFile('dist/index.html', 'dist/404.html');
await writeFile('dist/.nojekyll', '');
