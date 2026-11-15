# LOVE.exe — The Secret Love Experience

A complete static romantic experience built with React, Vite, TypeScript, Tailwind CSS, Motion and Lucide. Five cinematic chapters, 18 questions, local photography, optional name personalization, a private confession and a click-only WhatsApp invitation.

## Run locally

Install Node.js **22.12 or newer** (Node 24 is also supported), then run from this folder:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the URL printed by Vite, normally http://127.0.0.1:5173. Windows commands use `npm.cmd` so PowerShell's script execution policy does not block npm. On macOS/Linux use `npm`.

```powershell
npm.cmd run build
npm.cmd run preview
```

The production site is generated in `dist/`. It needs only static hosting. Node is a development/build dependency, not a production server. Do not open `index.html` with `file://`; use the local server.

## Customize the experience

Edit **`src/config/loveConfig.ts`**:

| Setting | Purpose |
| --- | --- |
| `opening`, `ui` | Welcome, labels, chapter names and interaction copy |
| `title`, `seo` | Page title, search description and social sharing text (also applied at build time) |
| `questions` | Questions, choices, reactions, entertainment-score weights and image choices |
| `interludes` | Surprise messages; `after` is the zero-based question index |
| `gallery.photos` | Scene photographs and accessible image descriptions |
| `gallery.personalPhotos` | Personal photographs; use an empty array to hide the personal gallery |
| `suspense`, `reveal` | Countdown introduction, confession and ending |
| `whatsapp` | International digits-only number and the exact prefilled message |
| `palette` | Background, accent, rose and text colors |
| `sound` | Music, heartbeat, volume and optional local music path |

Use paths such as `photos/my-photo.webp`, without `public/` or a leading slash. Put files in `public/photos/`. The existing five personal photos are optimized copies of the supplied photos; original files are untouched. Strip metadata and optimize any replacements before committing. `node scripts/prepare-photos.mjs` regenerates the bundled assets from the original `photos/` and downloaded JPGs if those originals are available; **normal builds do not require this script or the original photos**.

Scene-photo credits and license links are in `public/photos/CREDITS.md`. The local fonts use SIL Open Font Licenses in their installed Fontsource packages. The custom heart artwork and synthesized audio are original. All fonts and photographs are hosted with the site; there are no third-party runtime asset requests.

The default music is a gentle synthesized four-chord loop with heartbeat and chime effects. It starts only after the visitor enables sound. To use your own licensed track, add it to `public/audio/` and set `sound.musicUrl` to `audio/your-track.mp3`. Sound pauses in background tabs. `enabledByDefault: true` requests sound after the explicit “Let’s find out” gesture, never on page load. Browser audio support and user settings still apply.

Tap the interactive heart five times to find the hidden French message.

## Publish free on GitHub Pages

This folder has not been published and no GitHub repository or authenticated session has been assumed. Perform these steps once:

1. Sign in to https://github.com/new and create an **empty public repository** named **`love-exe`**. Do not initialize it with a README, license or `.gitignore`.
2. In PowerShell, run the following from this project folder. Replace `YOUR_GITHUB_USERNAME` with your actual username:

```powershell
git init -b main
git add .
git commit -m "Build LOVE.exe cinematic love experience"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/love-exe.git
git push -u origin main
```

Git may open its normal browser sign-in flow. Complete that yourself. If Git asks for your author identity, configure your own name and email with `git config user.name` and `git config user.email`, then repeat the commit. Never put an authentication token in the repository.

3. Open the repository's **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Open **Actions → Deploy LOVE.exe to GitHub Pages → Run workflow → main → Run workflow**. If the first automatic run happened before Pages was enabled, rerun it here.
5. Wait for both jobs to finish successfully. The site will be available at:

```text
https://YOUR_GITHUB_USERNAME.github.io/love-exe/
```

Subsequent pushes to `main` automatically redeploy:

```powershell
git add .
git commit -m "Personalize the love experience"
git push
```

`vite.config.ts` uses `base: './'` and every public asset is resolved through Vite's base. This supports any project repository name, a root user site or a custom domain. Chapters use React state rather than pathname routes: refreshing the site starts a fresh experience at the same URL. There is no server-side routing or persisted visitor state.

The workflow uses `actions/configure-pages` to supply the final `SITE_URL`. `scripts/finalize-build.mjs` sets absolute Open Graph/Twitter image URLs, the canonical URL and `og:url`, and emits `.nojekyll` and a fallback page. The included preview image is `public/og-image.jpg` (1200 × 630). For manual deployment, set the real URL before building:

```powershell
$env:SITE_URL = 'https://YOUR_GITHUB_USERNAME.github.io/love-exe'
npm.cmd run build
```

The default local build intentionally has relative preview metadata because its public address is unknown. Social apps may cache previews; their crawlers need to fetch the public URL after deployment. If changing the branding, update `title` and `seo` in `src/config/loveConfig.ts`, and replace the preview image. Vite injects this configuration into `index.html` automatically.

Official deployment reference: https://vite.dev/guide/static-deploy#github-pages

## Privacy and behavior

- No backend, login, analytics, cookies, local storage or database.
- The name and quiz answers exist only in React memory and disappear on refresh/replay.
- The result percentage and “heart analysis” are labeled entertainment; they are not compatibility measurements.
- WhatsApp opens only after pressing **Send Me Your Love**. The number is `212644850844`; `encodeURIComponent` builds the prefilled message. Names and answers are never appended. The visitor must send the message themselves in WhatsApp.
- Native sharing is used when supported; otherwise the link is copied. If clipboard access is unavailable, a selectable link appears in a dialog.
- Reduced motion disables ambient canvas particles, floating effects and heartbeat animation. Dialogs support Escape and focus restoration. Question content leaving the screen becomes inert to prevent rapid taps interacting with an outgoing scene.
- Particle counts are capped for mobile performance; sustained celebrations generate thousands of particles over time without thousands of simultaneous DOM elements.

## Verification

```powershell
npm.cmd run build
npm.cmd test
```

The tests use the installed Google Chrome browser. If Chrome is unavailable, install it, or remove `channel: 'chrome'` from `playwright.config.ts` and run `npx playwright install chromium` to use Playwright's Chromium.

Tests cover 360/390/430/1440px layouts, both complete reveal paths, answer revision, personalized/anonymous visits, audio toggles, image lightbox, keyboard dialogs, replay, Easter egg, copy/manual sharing fallbacks, privacy before the WhatsApp click, the exact WhatsApp URL, and automated accessibility checks. The WhatsApp destination is intercepted in tests; no messages are sent. Screenshots are written to the git-ignored `qa/` folder.

Automated browser emulation does not replace testing on a physical iPhone or Android device. Web Share sheets and WhatsApp handoff vary by operating system.

## Project structure

```text
src/config/loveConfig.ts       Editable content, photos, sound and theme
src/App.tsx                   Five-chapter state machine and scenes
src/components/               Heart artwork, particle canvas, accessible dialog
src/hooks/useRomanticAudio.ts  Gesture-activated local audio
src/styles.css                Responsive art direction and reduced motion
public/photos/                Optimized local images and credits
public/og-image.jpg            Social sharing image
scripts/                      Asset preparation and metadata finalization
tests/                        End-to-end browser tests
.github/workflows/deploy.yml   Automatic GitHub Pages deployment
```
