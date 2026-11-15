import { test, expect } from '@playwright/test';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

test('Production assets work from a GitHub Pages project subfolder and on refresh', async ({page}) => {
  const failed: string[] = [];
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('http://127.0.0.1:4173/love-exe/');
  await expect(page.getByRole('button', {name: 'Unlock My Secret'})).toBeVisible();
  await expect(page.locator('.hero-art img').first()).toHaveJSProperty('naturalWidth', 1000);
  await page.getByRole('button', {name: 'Unlock My Secret'}).click();
  await page.getByRole('button', {name: 'Keep a little mystery'}).click();
  await expect(page.locator('.choice').first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', {name:'Unlock My Secret'})).toBeVisible();
  expect(failed).toEqual([]);
});

test('Deployment metadata has absolute social-image and canonical URLs', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'love-exe-metadata-'));
  try {
    await mkdir(join(directory, 'dist'));
    await writeFile(join(directory, 'dist/index.html'), await readFile('dist/index.html'));
    execFileSync(process.execPath, [resolve('scripts/finalize-build.mjs')], {cwd:directory, env:{...process.env, SITE_URL:'https://example.github.io/love-exe/'}});
    const html = await readFile(join(directory, 'dist/index.html'), 'utf8');
    expect(html).toContain('content="https://example.github.io/love-exe/og-image.jpg"');
    expect(html).toContain('<link rel="canonical" href="https://example.github.io/love-exe/"');
    expect(await readFile(join(directory, 'dist/404.html'), 'utf8')).toBe(html);
    expect(await readFile(join(directory, 'dist/.nojekyll'), 'utf8')).toBe('');
  } finally {
    // Remove only the unique temporary directory created by this test.
    if (resolve(directory).startsWith(resolve(tmpdir()) + '\\') || resolve(directory).startsWith(resolve(tmpdir()) + '/')) await rm(directory, {recursive:true, force:true});
  }
});
