import { defineConfig } from '@playwright/test';

import { resolveCloseDoseMdTarget } from './tests/helpers/target.mjs';

const target = resolveCloseDoseMdTarget();

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: target.baseURL,
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: target.external
    ? undefined
    : {
        command: 'node tests/serve-dist.mjs',
        url: target.baseURL,
        reuseExistingServer: false,
        timeout: 15_000
      }
});
