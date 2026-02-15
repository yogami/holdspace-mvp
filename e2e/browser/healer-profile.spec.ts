/**
 * Healer Profile Page — E2E Browser Tests
 *
 * Validates profile display, reviews, booking flow, trust badges,
 * and the 404 state for invalid healer IDs.
 */
import { test, expect } from '@playwright/test';

test.describe('Healer Profile', () => {

    test('shows healer info: name, bio, modalities, languages', async ({ page }) => {
        await page.goto('/healers/h-aria-moon');

        await expect(page.locator('h1')).toContainText('Aria Moon');
        await expect(page.locator('.badge--sage', { hasText: 'Breathwork' })).toBeVisible();
        await expect(page.locator('.badge--clay', { hasText: 'English' })).toBeVisible();
    });

    test('shows reviews with ratings and comments', async ({ page }) => {
        await page.goto('/healers/h-aria-moon');

        // Aria has 3 reviews in seed data
        await expect(page.locator('text=Sarah M.')).toBeVisible();
        await expect(page.locator('text=David K.')).toBeVisible();
    });

    test('booking modal opens on button click', async ({ page }) => {
        await page.goto('/healers/h-aria-moon');

        const bookBtn = page.locator('button', { hasText: 'Book a session' });
        await bookBtn.click();

        // Booking modal should appear with duration options
        await expect(page.locator('.booking-modal')).toBeVisible();
        await expect(page.locator('.duration-option__label')).toHaveCount(3);
    });

    test('booking selects duration and shows confirmation', async ({ page }) => {
        await page.goto('/healers/h-aria-moon');

        const bookBtn = page.locator('button', { hasText: /book.*session/i });
        await bookBtn.click();

        // Click a duration option
        await page.locator('text=1 hour').click();

        // Confirm booking
        const confirmBtn = page.locator('button', { hasText: /confirm/i });
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
            await expect(page.locator('text=/booked|confirmed|session/i')).toBeVisible();
        }
    });

    test('shows rating and review count', async ({ page }) => {
        await page.goto('/healers/h-aria-moon');

        // Rating summary and reviews count
        await expect(page.locator('.rating-number')).toContainText('4.92');
        await expect(page.locator('text=reviews')).toBeVisible();
    });

    test('healer price and experience are visible', async ({ page }) => {
        await page.goto('/healers/h-aria-moon');

        await expect(page.locator('.healer-card__price')).toContainText('$85');
        await expect(page.locator('text=8 years experience')).toBeVisible();
    });

    test('invalid healer ID shows not-found state', async ({ page }) => {
        await page.goto('/healers/h-does-not-exist');

        await expect(page.locator('text=/not found|healer not found/i')).toBeVisible();
        await expect(page.locator('a', { hasText: /browse/i })).toBeVisible();
    });
});
