/**
 * Dashboard — E2E Browser Tests
 *
 * Validates the healer command center: stats, sessions,
 * availability toggle, programs, and navigation.
 */
import { test, expect } from '@playwright/test';

test.describe('Healer Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
    });

    test('shows welcome message with healer name', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Welcome back, Aria');
    });

    test('shows 4 stat cards', async ({ page }) => {
        const cards = page.locator('.dashboard-stat-card');
        await expect(cards).toHaveCount(4);
    });

    test('stat cards show correct values', async ({ page }) => {
        // Trust score = 88
        await expect(page.locator('.dashboard-stat-card__value', { hasText: '88' })).toBeVisible();
        // Total sessions = 340
        await expect(page.locator('.dashboard-stat-card__value', { hasText: '340' })).toBeVisible();
        // Avg rating = 4.92
        await expect(page.locator('.dashboard-stat-card__value', { hasText: '4.92' })).toBeVisible();
    });

    test('availability toggle switches between online and offline', async ({ page }) => {
        // Should start online
        await expect(page.locator('text=You\'re online')).toBeVisible();

        // Click Go Offline
        await page.locator('button', { hasText: 'Go Offline' }).click();
        await expect(page.locator('text=You\'re offline')).toBeVisible();

        // Click Go Online
        await page.locator('button', { hasText: 'Go Online' }).click();
        await expect(page.locator('text=You\'re online')).toBeVisible();
    });

    test('shows upcoming sessions with details', async ({ page }) => {
        await expect(page.locator('h3', { hasText: 'Upcoming Sessions' })).toBeVisible();

        // Breathwork session — use item title selector to match rendered label
        const titles = page.locator('.dashboard-session-item__title');
        await expect(titles.first()).toContainText('Breathwork');
        await expect(page.locator('.badge', { hasText: 'confirmed' })).toBeVisible();

        // Somatic session
        await expect(titles.nth(1)).toContainText('Somatic Work');
        await expect(page.locator('.badge', { hasText: 'pending' })).toBeVisible();
    });

    test('shows recent sessions with status badges', async ({ page }) => {
        await expect(page.locator('h3', { hasText: 'Recent Sessions' })).toBeVisible();

        const completedBadges = page.locator('.badge', { hasText: 'completed' });
        const count = await completedBadges.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('program card shows milestones', async ({ page }) => {
        await expect(page.locator('text=Breathwork Foundations')).toBeVisible();

        // Milestones
        await expect(page.locator('.program-milestone__title', { hasText: 'Grounding' })).toBeVisible();
        await expect(page.locator('.program-milestone__title', { hasText: 'Deepening' })).toBeVisible();
        await expect(page.locator('.program-milestone__title', { hasText: 'Integration' })).toBeVisible();
    });

    test('new program builder toggles open and closed', async ({ page }) => {
        // Click "+ New Program"
        await page.locator('button', { hasText: '+ New Program' }).click();
        await expect(page.locator('.program-builder')).toBeVisible();
        await expect(page.locator('text=Create New Program')).toBeVisible();

        // Click "Cancel"
        await page.locator('button', { hasText: 'Cancel' }).click();
        await expect(page.locator('.program-builder')).not.toBeVisible();
    });

    test('profile completeness bar shows percentage', async ({ page }) => {
        await expect(page.locator('text=78% complete')).toBeVisible();
        await expect(page.locator('.profile-completeness__fill')).toBeVisible();
    });

    test('Complete Profile link navigates to /onboarding', async ({ page }) => {
        const link = page.locator('a', { hasText: 'Complete Profile' });
        await expect(link).toHaveAttribute('href', '/onboarding');
    });

    test('nav Marketplace link points to /healers', async ({ page }) => {
        const link = page.locator('.nav__links a', { hasText: 'Marketplace' });
        await expect(link).toHaveAttribute('href', '/healers');
    });
});
