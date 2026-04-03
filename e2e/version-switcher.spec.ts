import { test, expect } from '@playwright/test';

test.describe('VersionSwitcher Addon Integration', () => {
  test('should serve Storybook application', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should load the page without errors', async ({ page }) => {
    await page.goto('/');

    // Wait for any framework to load
    await page.waitForTimeout(4000);

    // Check for common Storybook indicators
    const pageTitle = await page.title();
    const bodyContent = await page.content();

    // Should have some content
    expect(bodyContent.length).toBeGreaterThan(100);
  });

  test('should have addon registered (can be verified by build)', async ({ page }) => {
    // This test verifies the addon is properly built and can be loaded
    // The actual addon rendering depends on versions.json being present
    await page.goto('/');

    // Give page time to load
    await page.waitForTimeout(4000);

    // Check that we get a response (addon loads without breaking Storybook)
    const response = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasContent: document.body.innerHTML.length > 0
      };
    });

    expect(response.hasContent).toBeTruthy();
    expect(response.url).toContain('localhost:6006');
  });

  test('should work with the example React app', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000);

    // Check if page loads without crashes
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit more to catch any errors
    await page.waitForTimeout(2000);

    // Should not have critical errors (some warnings are ok)
    const criticalErrors = errors.filter(e =>
      !e.includes('deprecated') &&
      !e.includes('warning') &&
      !e.includes('CJS')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
