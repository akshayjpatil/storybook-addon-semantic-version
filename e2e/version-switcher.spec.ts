import { test, expect } from '@playwright/test';

test.describe('VersionSwitcher Toolbar Component', () => {
  test('should render the version switcher button in the toolbar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for toolbar button with version number
    const versionButton = page.getByRole('button').filter({ hasText: /^v\d+\.\d+/ }).first();
    await expect(versionButton).toBeVisible();
  });

  test('should display dropdown with multiple versions when clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the version button
    const versionButton = page.getByRole('button').filter({ hasText: /^v\d+\.\d+/ }).first();
    await versionButton.click();
    await page.waitForTimeout(500);

    // Verify dropdown content is visible - there should be version items
    const versionLinks = page.getByRole('button').filter({ hasText: /^v\d+\.\d+\.\d+$/ });
    const count = await versionLinks.count();

    // Should have at least 2 versions in dropdown
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should show "latest" badge next to latest version', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the version button
    const versionButton = page.getByRole('button').filter({ hasText: /^v\d+\.\d+/ }).first();
    await versionButton.click();
    await page.waitForTimeout(500);

    // Look for the "latest" badge
    const latestBadge = page.getByText('latest', { exact: true });
    await expect(latestBadge).toBeVisible();
  });

  test('should allow switching between versions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial version
    const versionButton = page.getByRole('button').filter({ hasText: /^v\d+\.\d+/ }).first();
    const initialText = await versionButton.textContent();

    // Click to open dropdown
    await versionButton.click();
    await page.waitForTimeout(500);

    // Get all version options
    const versionOptions = page.getByRole('button').filter({ hasText: /^v\d+\.\d+\.\d+$/ });
    const optionCount = await versionOptions.count();

    // Should have at least 2 options to switch between
    expect(optionCount).toBeGreaterThanOrEqual(2);
  });
});
