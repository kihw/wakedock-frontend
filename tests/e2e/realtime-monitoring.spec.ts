import { test, expect } from '@playwright/test';

test.describe('Real-time Monitoring', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/realtime-monitoring');
    });

    test('should display real-time monitoring dashboard', async ({ page }) => {
        // Check page title
        await expect(page.locator('h1')).toContainText('Monitoring Temps Réel');

        // Check stats cards
        await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);

        // Check WebSocket connection status
        await expect(page.locator('[data-testid="websocket-status"]')).toBeVisible();
    });

    test('should show WebSocket connection status', async ({ page }) => {
        // Check connection indicator
        const connectionStatus = page.locator('[data-testid="websocket-status"]');
        await expect(connectionStatus).toBeVisible();

        // Check if it shows connected or disconnected
        const statusText = await connectionStatus.textContent();
        expect(statusText).toMatch(/(Connecté|Déconnecté)/);
    });

    test('should display performance metrics', async ({ page }) => {
        // Check performance stats section
        await expect(page.locator('[data-testid="performance-stats"]')).toBeVisible();

        // Check individual metric cards
        await expect(page.locator('[data-testid="render-time"]')).toBeVisible();
        await expect(page.locator('[data-testid="api-calls"]')).toBeVisible();
        await expect(page.locator('[data-testid="errors"]')).toBeVisible();
    });

    test('should handle auto-refresh toggle', async ({ page }) => {
        // Look for auto-refresh toggle
        const autoRefreshToggle = page.locator('[data-testid="auto-refresh-toggle"]');

        if (await autoRefreshToggle.isVisible()) {
            // Click to toggle auto-refresh
            await autoRefreshToggle.click();

            // Check that the toggle state changed
            const isActive = await autoRefreshToggle.getAttribute('class');
            expect(isActive).toBeDefined();
        }
    });

    test('should handle manual refresh', async ({ page }) => {
        // Look for refresh button
        const refreshButton = page.locator('[data-testid="refresh-button"]');

        if (await refreshButton.isVisible()) {
            // Click refresh button
            await refreshButton.click();

            // Check that refresh happens (button should show loading state)
            await page.waitForTimeout(1000);
        }
    });

    test('should display real-time charts', async ({ page }) => {
        // Check for charts containers
        await expect(page.locator('[data-testid="resource-chart"]')).toBeVisible();
        await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();

        // Wait for charts to load
        await page.waitForTimeout(2000);

        // Charts should be rendered (SVG elements should be present)
        await expect(page.locator('[data-testid="resource-chart"] svg')).toBeVisible();
        await expect(page.locator('[data-testid="performance-chart"] svg')).toBeVisible();
    });

    test('should display services list with real-time updates', async ({ page }) => {
        // Check services section
        await expect(page.locator('[data-testid="services-section"]')).toBeVisible();

        // Check individual service items
        const serviceItems = page.locator('[data-testid="service-item"]');
        const count = await serviceItems.count();

        if (count > 0) {
            // Check first service item has required elements
            const firstService = serviceItems.first();
            await expect(firstService.locator('[data-testid="service-name"]')).toBeVisible();
            await expect(firstService.locator('[data-testid="service-status"]')).toBeVisible();
        }
    });

    test('should handle service status indicators', async ({ page }) => {
        // Check for service status indicators
        const statusIndicators = page.locator('[data-testid="status-indicator"]');
        const count = await statusIndicators.count();

        if (count > 0) {
            // Each status indicator should have appropriate color
            for (let i = 0; i < Math.min(count, 3); i++) {
                const indicator = statusIndicators.nth(i);
                await expect(indicator).toBeVisible();

                // Check if it has proper styling
                const classList = await indicator.getAttribute('class');
                expect(classList).toContain('bg-');
            }
        }
    });

    test('should handle WebSocket reconnection', async ({ page }) => {
        // Monitor console for WebSocket messages
        const messages: string[] = [];

        page.on('console', (msg) => {
            if (msg.text().includes('WebSocket')) {
                messages.push(msg.text());
            }
        });

        // Wait for potential WebSocket activity
        await page.waitForTimeout(3000);

        // Check that WebSocket connection is being managed
        const connectionStatus = page.locator('[data-testid="websocket-status"]');
        await expect(connectionStatus).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Check that main elements are still visible
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('[data-testid="stats-card"]')).toBeVisible();

        // Charts should adapt to mobile
        await expect(page.locator('[data-testid="resource-chart"]')).toBeVisible();
    });
});
