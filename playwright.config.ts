import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', ...devices['Desktop Chrome'], channel: 'chrome', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run dev -- --port 5173', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
    { command: 'npm run preview -- --port 4173 --base /love-exe/', url: 'http://127.0.0.1:4173/love-exe/', reuseExistingServer: true },
  ],
});
