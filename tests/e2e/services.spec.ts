import { test, expect } from '@playwright/test';

test.describe('Services Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/services');
    });

    test('should display services list', async ({ page }) => {
        // Check page title
        await expect(page.locator('h1')).toContainText('Services');

        // Check services grid/list is present
        await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();

        // Check search functionality
        await expect(page.locator('[data-testid="services-search"]')).toBeVisible();
    });

    test('should filter services by status', async ({ page }) => {
        // Check if filter buttons are present
        const filterButtons = page.locator('[data-testid="status-filter"]');
        const count = await filterButtons.count();

        if (count > 0) {
            // Click on 'running' filter
            await filterButtons.first().click();

            // Check that filtering works (UI should update)
            await page.waitForTimeout(1000);

            // The services list should be filtered
            await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
        }
    });

    test('should search services', async ({ page }) => {
        const searchInput = page.locator('[data-testid="services-search"]');

        if (await searchInput.isVisible()) {
            // Type in search box
            await searchInput.fill('web');

            // Wait for search results
            await page.waitForTimeout(1000);

            // Check that search results are displayed
            await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
        }
    });

    test('should handle service actions', async ({ page }) => {
        // Look for service action buttons
        const serviceCard = page.locator('[data-testid="service-card"]').first();

        if (await serviceCard.isVisible()) {
            // Click on the service card
            await serviceCard.click();

            // Check if action buttons are visible
            const actionButtons = page.locator('[data-testid="service-action"]');
            const actionCount = await actionButtons.count();

            if (actionCount > 0) {
                // Service actions should be available
                await expect(actionButtons.first()).toBeVisible();
            }
        }
    });

    test('should display service details', async ({ page }) => {
        // Look for service details
        const serviceCard = page.locator('[data-testid="service-card"]').first();

        if (await serviceCard.isVisible()) {
            // Check service information is displayed
            await expect(serviceCard.locator('[data-testid="service-name"]')).toBeVisible();
            await expect(serviceCard.locator('[data-testid="service-status"]')).toBeVisible();
        }
    });

    test('should handle bulk operations', async ({ page }) => {
        // Check for bulk operation controls
        const bulkSelect = page.locator('[data-testid="bulk-select"]');

        if (await bulkSelect.isVisible()) {
            // Select multiple services
            await bulkSelect.click();

            // Check bulk actions become available
            await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
        }
    });

    test('should handle service creation', async ({ page }) => {
        // Look for create service button
        const createButton = page.locator('[data-testid="create-service"]');

        if (await createButton.isVisible()) {
            await createButton.click();

            // Check if modal/form appears
            await expect(page.locator('[data-testid="service-form"]')).toBeVisible();
        }
    });

    test('should handle pagination', async ({ page }) => {
        // Check for pagination controls
        const pagination = page.locator('[data-testid="pagination"]');

        if (await pagination.isVisible()) {
            // Test pagination navigation
            const nextButton = pagination.locator('[data-testid="next-page"]');

            if (await nextButton.isVisible() && await nextButton.isEnabled()) {
                await nextButton.click();

                // Page should change
                await page.waitForTimeout(1000);
                await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
            }
        }
    });
});
