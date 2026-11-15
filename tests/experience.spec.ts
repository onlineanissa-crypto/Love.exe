import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function checkWidth(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
async function begin(page: Page, name = '') {
  await page.getByRole('button', { name: 'Unlock My Secret' }).click();
  if (name) await page.getByLabel('Your name (optional)').fill(name);
  await page.getByRole('button', { name: 'Let’s find out' }).click();
}
async function completeQuiz(page: Page, lastChoice = false) {
  for (let i = 0; i < 18; i++) {
    const choices = page.locator(`[data-question="${i}"]:not([inert]) .choice`);
    await expect(choices.first()).toBeVisible();
    await (lastChoice ? choices.last() : choices.first()).click();
    await expect(page.locator('.reaction')).not.toBeEmpty();
    await page.getByRole('button', { name: i === 17 ? 'Let’s daydream' : 'One step closer' }).click();
    if (i === 5 || i === 11) await page.getByRole('button', { name: 'Follow the butterflies' }).click();
  }
  await expect(page.getByRole('heading', { name: 'A thousand places. Only you.' })).toBeVisible();
}

for (const width of [360, 390, 430, 1440]) {
  test(`Opening and questions fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', {name:'Some secrets are meant to be felt.'})).toBeVisible();
    await page.waitForTimeout(1900);
    await checkWidth(page);
    await expect(page.locator('.hero-art img').first()).toHaveJSProperty('complete', true);
    await page.screenshot({ path: `qa/opening-${width}.png`, fullPage: true });
    await begin(page);
    await checkWidth(page);
    await page.screenshot({ path: `qa/question-${width}.png`, fullPage: true });
    await expect(page.getByRole('button', {name: 'Sound off'})).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', {name: 'Sound off'}).click();
    await expect(page.getByRole('button', {name: 'Sound on'})).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', {name: 'Sound on'}).click();
    await expect(page.getByRole('button', {name: 'Sound off'})).toHaveAttribute('aria-pressed', 'false');
  });
}

test('Complete personalized journey, nervous reveal, WhatsApp, sharing and replay', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  const outbound: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (!req.url().startsWith('http://127.0.0.1') && !req.url().startsWith('data:')) outbound.push(req.url()); });
  await page.goto('/');
  await begin(page, 'Amira');
  await completeQuiz(page);
  await expect(page.getByText('Amira, the hopeless romantic')).toBeVisible();
  await checkWidth(page);
  await page.screenshot({ path: 'qa/gallery-mobile.png', fullPage: true });
  await page.locator('.personal-photos button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'There’s something you should know' }).click();
  await page.getByRole('button', { name: 'I’m nervous' }).click();
  await expect(page.getByText('Take my hand. We can be nervous together.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'I love you.' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.reveal-name')).toHaveText('Amira,');
  const whatsapp = page.getByRole('link', { name: 'Send Me Your Love' });
  await expect(whatsapp).toHaveAttribute('target', '_blank');
  const url = new URL((await whatsapp.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe('/212644850844');
  expect(url.searchParams.get('text')).toBe("I love you ❤️ If I had to choose again, I'd still choose you. 💌");
  expect(outbound).toEqual([]);
  await checkWidth(page);
  await page.screenshot({ path: 'qa/reveal-mobile.png', fullPage: true });
  await context.route('https://wa.me/**', route => route.fulfill({ body: 'WhatsApp click verified without sending a message.' }));
  const popupPromise = page.waitForEvent('popup');
  await whatsapp.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(popup.url()).toContain('https://wa.me/212644850844');
  await popup.close();
  await page.evaluate(() => { Object.defineProperty(navigator, 'share', {value: undefined, configurable: true}); });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Share this experience' }).last().click();
  await expect(page.getByRole('status')).toContainText('copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('http://127.0.0.1:5173/');
  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole('button', {name:'Experience This Again'}).click();
  await expect(page.getByRole('button', {name:'Unlock My Secret'})).toBeVisible();
  await begin(page);
  await expect(page.getByLabel('Journey progress')).toHaveAttribute('aria-valuenow','1');
  expect(errors).toEqual([]);
});

test('Alternate answers, answer revision, confident reveal, keyboard and Easter egg', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', {name:'Unlock My Secret'}).click();
  await page.getByLabel('Your name (optional)').fill('A name that will be skipped');
  await page.getByRole('button', {name:'Keep a little mystery'}).click();
  await page.locator('.choice').first().click();
  await page.getByRole('button', {name:'One step closer'}).click();
  await page.getByRole('button', {name:'Go back'}).click();
  await expect(page.locator('.choice').first()).toHaveAttribute('aria-pressed','true');
  await completeQuiz(page, true);
  await page.getByRole('button', {name:'There’s something you should know'}).click();
  await page.getByRole('button', {name:'Yes, tell me!'}).click();
  await expect(page.getByRole('heading', {name:'I love you.'})).toBeVisible({timeout:15_000});
  await expect(page.locator('.reveal-name')).toHaveCount(0);
  for (let i = 0; i < 5; i++) await page.getByRole('button', {name:'Send a little heartbeat'}).first().click();
  await expect(page.getByRole('status')).toContainText('je t’aime');
  await page.screenshot({path:'qa/reveal-desktop.png', fullPage:true});
});

test('Keyboard dialog, fallback sharing, and opening accessibility', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole('button', {name:'Unlock My Secret'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Your name (optional)')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name:'Unlock My Secret'})).toBeFocused();
  await page.evaluate(() => { Object.defineProperty(navigator, 'share', {value: undefined, configurable:true}); Object.defineProperty(navigator, 'clipboard', {value: undefined, configurable:true}); });
  await page.getByRole('button', {name:'Share this experience'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Experience link')).toHaveValue('http://127.0.0.1:5173/');
});
