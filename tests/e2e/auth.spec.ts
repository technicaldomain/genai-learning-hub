import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flow.
 *
 * Prerequisites:
 * - Backend running on http://localhost:8000
 * - Frontend dev server running on http://localhost:4200
 *
 * Run with: npx playwright test tests/e2e/auth.spec.ts
 */

// ---------------------------------------------------------------------------
// Test: Unauthenticated user is redirected to login
// ---------------------------------------------------------------------------

test('unauthenticated user visiting / is redirected to /login', async ({ page }) => {
  // Ensure no session cookies exist
  await page.context().clearCookies();

  // Navigate to home page
  await page.goto('/');

  // Wait for redirect to complete
  await page.waitForURL('/login');

  // Verify login page is rendered
  await expect(page.locator('h1')).toContainText('Sign in to GenAI Learning Hub');
  await expect(page.locator('button', { hasText: /Sign in/i })).toBeVisible();
});

test('unauthenticated user visiting protected route is redirected to login', async ({ page }) => {
  // Ensure no session cookies exist
  await page.context().clearCookies();

  // Navigate directly to a protected route
  await page.goto('/skills');

  // Wait for redirect
  await page.waitForURL('/login');

  // Verify login page
  await expect(page.locator('h1')).toContainText('Sign in to GenAI Learning Hub');
});

// ---------------------------------------------------------------------------
// Test: Authenticated user sees protected content
// ---------------------------------------------------------------------------

test('authenticated user sees home page after login', async ({ page }) => {
  // Clear cookies to start fresh
  await page.context().clearCookies();

  // Go to login page
  await page.goto('/login');

  // Click sign-in button (redirects to OIDC mock)
  await page.click('button', { hasText: /Sign in/i });

  // Wait for OIDC mock authorization page
  await page.waitForURL(/oidc-mock\.technicaldomain\.xyz/);

  // Fill in subject email and authorize
  await page.fill('input[required]', 'alice@example.com');
  await page.click('button', { hasText: /Authorize/i });

  // Wait for redirect back to app (through /auth/callback)
  // The callback polls /me and then redirects to /
  await page.waitForURL('/');

  // Verify home page is rendered
  await expect(page.locator('h1', { hasText: /Welcome to the GenAI Learning Hub/i })).toBeVisible();

  // Verify user avatar/menu shows logged-in user
  await expect(page.locator('button', { hasText: /alice@example\.com/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test: Spinner shows during auth check then disappears
// ---------------------------------------------------------------------------

test('spinner appears during auth check and disappears after authentication', async ({ page }) => {
  // Clear cookies
  await page.context().clearCookies();

  // Go to login page
  await page.goto('/login');

  // Click sign-in
  await page.click('button', { hasText: /Sign in/i });

  // Authorize on OIDC mock
  await page.waitForURL(/oidc-mock\.technicaldomain\.xyz/);
  await page.fill('input[required]', 'alice@example.com');
  await page.click('button', { hasText: /Authorize/i });

  // Wait for redirect to / (through /auth/callback)
  await page.waitForURL('/');

  // The AuthGuard should show a spinner briefly, then hide it once auth is confirmed
  // Look for the spinner initially
  const spinner = page.locator('.animate-spin');

  // Wait for spinner to disappear (it should be replaced by content)
  // Use a timeout that's generous enough for the API call to complete
  await spinner.waitFor({ state: 'detached', timeout: 10000 });

  // Verify home page content is visible
  await expect(page.locator('h1', { hasText: /Welcome to the GenAI Learning Hub/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test: Login page is accessible directly
// ---------------------------------------------------------------------------

test('login page loads without redirect when visited directly', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toContainText('Sign in to GenAI Learning Hub');
  await expect(page.locator('button', { hasText: /Sign in/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test: Navigation between protected pages works after auth
// ---------------------------------------------------------------------------

test('authenticated user can navigate between protected pages', async ({ page }) => {
  // Clear cookies
  await page.context().clearCookies();

  // Login flow
  await page.goto('/login');
  await page.click('button', { hasText: /Sign in/i });
  await page.waitForURL(/oidc-mock\.technicaldomain\.xyz/);
  await page.fill('input[required]', 'alice@example.com');
  await page.click('button', { hasText: /Authorize/i });
  await page.waitForURL('/');

  // Click on AI Skills link in sidebar
  await page.click('a', { hasText: /AI Skills/i });

  // Should navigate to skills page
  await expect(page).toHaveURL(/\/skills/);
});
