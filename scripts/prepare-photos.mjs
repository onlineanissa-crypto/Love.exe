import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

await mkdir('public/photos', { recursive: true });
for (const file of await readdir('photos')) {
  if (!/\.jpe?g$/i.test(file)) continue;
  await sharp(join('photos', file)).rotate().resize(900, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(join('public/photos', `personal-${file.replace(/\.jpe?g$/i, '')}.webp`));
}
for (const name of ['together', 'sunset', 'stars']) {
  await sharp(`public/photos/${name}.jpg`).rotate().resize(1000, 1200, { fit: 'inside' }).webp({ quality: 84 }).toFile(`public/photos/${name}.webp`);
}
const photos = await Promise.all(['sunset', 'together', 'stars', 'personal-12166', 'personal-12424', 'personal-4793', 'personal-5083', 'personal-6814'].map(async (name, i) => ({ input: await sharp(`public/photos/${name}.webp`).resize(200, 230, {fit:'cover'}).png().toBuffer(), left: i * 200, top: 0 })));
await sharp({create:{width:1600,height:230,channels:3,background:'#10090e'}}).composite(photos).png().toFile('photo-contact.png');

// A self-contained social preview, rasterized once and served locally.
const scene = await sharp('public/photos/together.webp').resize(430, 470, {fit:'cover'}).modulate({saturation:.65}).toBuffer();
const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop stop-color="#713045"/><stop offset="1" stop-color="#10090e"/></radialGradient></defs><rect width="1200" height="630" fill="#10090e"/><ellipse cx="880" cy="310" rx="380" ry="400" fill="url(#g)"/><text x="72" y="83" fill="#f3d7e2" font-family="Georgia" font-size="29">LOVE<tspan fill="#e598b3">.exe</tspan></text><text x="72" y="172" fill="#d994b0" font-family="Arial" font-size="12" letter-spacing="4">A LITTLE SECRET, JUST FOR YOU</text><text x="67" y="275" fill="#fff3ed" font-family="Georgia" font-size="79">Some secrets</text><text x="67" y="365" fill="#fff3ed" font-family="Georgia" font-size="79">are meant to</text><text x="67" y="455" fill="#eeb6c7" font-family="Georgia" font-size="89" font-style="italic">be felt.</text><text x="73" y="552" fill="#c3a1b0" font-family="Arial" font-size="17">A little mystery. A lot of heart.</text><rect x="701" y="77" width="454" height="523" rx="2" fill="#e9ded1"/></svg>`);
const caption = Buffer.from('<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><text x="755" y="579" fill="#654551" font-family="Georgia" font-size="24" font-style="italic">what if it’s always been you?</text></svg>');
await sharp(overlay).composite([{input:scene,left:713,top:89},{input:caption,left:0,top:0}]).jpeg({quality:90}).toFile('public/og-image.jpg');
console.log('Optimized photos and social preview ready.');
