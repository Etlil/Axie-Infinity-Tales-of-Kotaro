const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 120000,
  expect: { timeout: 10000 },
  workers: 1,
  use: { baseURL: 'http://localhost:3000', viewport: { width: 1440, height: 900 }, headless: true },
  webServer: { command: 'npm start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, env: { BROWSER: 'none' }, timeout: 120000 },
});
