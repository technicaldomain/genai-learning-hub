import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for GenAI Learning Hub e2e tests.
 * Tests require a running backend (port 8000) and frontend dev server (port 4200).
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the Vite dev server before tests if not already running
  webServer: {
    command: 'npx nx dev frontend',
    port: 4200,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
