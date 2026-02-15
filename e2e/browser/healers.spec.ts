/**
 * Healers Marketplace — E2E Browser Tests
 *
 * Validates search, filtering (modality, language, price, online-only),
 * empty state, card content, and navigation to healer profiles.
 */
import { test, expect } from '@playwright/test';

test.describe('Healers Marketplace', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/healers');
    });

    test('shows all 6 healers by default', async ({ page }) => {
        const cards = page.locator('.healer-card');
        await expect(cards).toHaveCount(6);
    });

    test('shows "6 healers found" count', async ({ page }) => {
        await expect(page.locator('text=6 healers found')).toBeVisible();
    });

    test('search by name filters to matching healers', async ({ page }) => {
        const searchInput = page.locator('input[type="search"]');
        await searchInput.fill('Aria');

        const cards = page.locator('.healer-card');
        await expect(cards).toHaveCount(1);
        await expect(page.locator('.healer-card__name')).toContainText('Aria Moon');
    });

    test('search by bio keyword filters results', async ({ page }) => {
        const searchInput = page.locator('input[type="search"]');
        await searchInput.fill('Reiki');

        const cards = page.locator('.healer-card');
        await expect(cards).toHaveCount(1);
        await expect(page.locator('.healer-card__name')).toContainText('Kai Tanaka');
    });

    test('modality filter narrows results', async ({ page }) => {
        // Click the "Sound Healing" filter pill
        await page.locator('.filter-pill', { hasText: 'Sound Healing' }).click();

        const cards = page.locator('.healer-card');
        const count = await cards.count();
        expect(count).toBeLessThan(6);
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('multiple modality filters combine (union)', async ({ page }) => {
        await page.locator('.filter-pill', { hasText: 'Grief Holding' }).click();
        const countAfterOne = await page.locator('.healer-card').count();

        await page.locator('.filter-pill', { hasText: 'Meditation' }).click();
        const countAfterTwo = await page.locator('.healer-card').count();

        // Union should show at least as many as first filter
        expect(countAfterTwo).toBeGreaterThanOrEqual(countAfterOne);
    });

    test('language filter shows only matching healers', async ({ page }) => {
        await page.locator('select').selectOption('Japanese');

        const cards = page.locator('.healer-card');
        await expect(cards).toHaveCount(1);
        await expect(page.locator('.healer-card__name')).toContainText('Kai Tanaka');
    });

    test('price filter excludes expensive healers', async ({ page }) => {
        // Set max price to $70 using the range slider
        const slider = page.locator('input[type="range"]');
        await slider.fill('70');

        const cards = page.locator('.healer-card');
        const count = await cards.count();
        // Only Ravi is $70, all others are >= $75
        expect(count).toBeLessThan(6);
    });

    test('online-only filter shows only available healers', async ({ page }) => {
        await page.locator('.filter-pill', { hasText: 'Online now' }).click();

        const cards = page.locator('.healer-card');
        const count = await cards.count();
        expect(count).toBeLessThan(6);
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('impossible filter combination shows empty state', async ({ page }) => {
        // Search for something that won't match
        const searchInput = page.locator('input[type="search"]');
        await searchInput.fill('ZZZNONEXISTENT');

        await expect(page.locator('text=No healers match your filters')).toBeVisible();
    });

    test('healer cards show trust badges', async ({ page }) => {
        const badges = page.locator('.trust-badge--compact');
        const count = await badges.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('healer cards show availability indicators', async ({ page }) => {
        const dots = page.locator('.availability__dot');
        const count = await dots.count();
        expect(count).toBe(6);
    });

    test('clicking a healer card navigates to their profile', async ({ page }) => {
        await page.locator('.healer-card').first().click();
        await expect(page).toHaveURL(/\/healers\/h-/);
    });
});
