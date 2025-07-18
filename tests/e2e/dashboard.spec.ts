import { test, expect } from '@playwright/test';

test.describe('WakeDock Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display dashboard with all key sections', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle(/WakeDock/);

        // Check main dashboard elements
        await expect(page.locator('h1')).toContainText('Dashboard');

        // Check stats cards are present
        await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);

        // Check navigation menu
        await expect(page.locator('[data-testid="nav-menu"]')).toBeVisible();

        // Check for services section
        await expect(page.locator('[data-testid="services-section"]')).toBeVisible();
    });

    test('should navigate to services page', async ({ page }) => {
        // Click on services navigation
        await page.click('[data-testid="nav-services"]');

        // Should be on services page
        await expect(page).toHaveURL(/.*services/);
        await expect(page.locator('h1')).toContainText('Services');
    });

    test('should navigate to real-time monitoring', async ({ page }) => {
        // Click on real-time monitoring navigation
        await page.click('[data-testid="nav-realtime"]');

        // Should be on real-time monitoring page
        await expect(page).toHaveURL(/.*realtime-monitoring/);
        await expect(page.locator('h1')).toContainText('Monitoring Temps Réel');
    });

    test('should display performance metrics', async ({ page }) => {
        // Navigate to real-time monitoring
        await page.goto('/realtime-monitoring');

        // Check for performance stats
        await expect(page.locator('[data-testid="performance-stats"]')).toBeVisible();

        // Check WebSocket connection indicator
        await expect(page.locator('[data-testid="websocket-status"]')).toBeVisible();
    });

    test('should handle responsive design', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Check that navigation is responsive
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        // Check that content adapts
        await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });

    test('should load all charts without errors', async ({ page }) => {
        // Go to dashboard
        await page.goto('/');

        // Wait for charts to load
        await page.waitForSelector('[data-testid="dashboard-chart"]');

        // Check no console errors
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                throw new Error(`Console error: ${msg.text()}`);
            }
        });

        // Check that charts are rendered
        await expect(page.locator('[data-testid="dashboard-chart"]')).toBeVisible();
    });

    test('should handle theme switching', async ({ page }) => {
        // Check initial theme
        const initialTheme = await page.getAttribute('html', 'class');

        // Click theme toggle if present
        const themeToggle = page.locator('[data-testid="theme-toggle"]');
        if (await themeToggle.isVisible()) {
            await themeToggle.click();

            // Check theme changed
            const newTheme = await page.getAttribute('html', 'class');
            expect(newTheme).not.toBe(initialTheme);
        }
    });
});
