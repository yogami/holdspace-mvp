/**
 * Session Flow — E2E Browser Tests
 *
 * Validates active session, timer, SOS button, end-session flow,
 * review page (star rating, submit, skip), and safety report page.
 */
import { test, expect } from '@playwright/test';

test.describe('Session Page', () => {

    test('renders session with healer name', async ({ page }) => {
        await page.goto('/session/h-aria-moon');
        await expect(page.locator('.session-bar')).toContainText('Aria Moon');
        await expect(page.locator('text=Your session is in progress')).toBeVisible();
    });

    test('timer is visible and starts at 00:00', async ({ page }) => {
        await page.goto('/session/h-aria-moon');
        const timer = page.locator('.session-timer');
        await expect(timer).toBeVisible();
        await expect(timer).toContainText('00:0');
    });

    test('timer increments after 2 seconds', async ({ page }) => {
        await page.goto('/session/h-aria-moon');
        const timer = page.locator('.session-timer');
        // Wait for timer to tick
        await page.waitForTimeout(2500);
        const text = await timer.textContent();
        expect(text).not.toBe('00:00');
    });

    test('end session button navigates to review', async ({ page }) => {
        await page.goto('/session/h-aria-moon');
        await page.locator('.btn--end', { hasText: 'End Session' }).click();
        await expect(page).toHaveURL(/\/session\/h-aria-moon\/review/);
    });

    test('SOS button shows confirming state on first click', async ({ page }) => {
        await page.goto('/session/h-aria-moon');
        const sosBtn = page.locator('.sos-button');
        await expect(sosBtn).toBeVisible();
        await sosBtn.click();
        await expect(page.locator('.sos-button--confirming')).toBeVisible();
    });

    test('SOS double-click triggers and navigates with sos=true', async ({ page }) => {
        await page.goto('/session/h-aria-moon');
        const sosBtn = page.locator('.sos-button');
        await sosBtn.click();
        // Second click during confirming state
        await page.locator('.sos-button--confirming').click();
        await expect(page).toHaveURL(/sos=true/);
    });

    test('invalid session ID shows not-found', async ({ page }) => {
        await page.goto('/session/h-nonexistent');
        await expect(page.locator('text=Session not found')).toBeVisible();
        await expect(page.locator('a', { hasText: 'Browse healers' })).toBeVisible();
    });
});

test.describe('Review Page', () => {

    test('shows star selector with 5 stars', async ({ page }) => {
        await page.goto('/session/h-aria-moon/review');
        const stars = page.locator('.star-select button');
        await expect(stars).toHaveCount(5);
    });

    test('clicking a star shows sentiment label', async ({ page }) => {
        await page.goto('/session/h-aria-moon/review');

        // Click 5th star
        await page.locator('.star-select button').nth(4).click();
        await expect(page.locator('text=Transformative')).toBeVisible();

        // Click 2nd star
        await page.locator('.star-select button').nth(1).click();
        await expect(page.locator('text=Could be better')).toBeVisible();
    });

    test('submit button is disabled without rating', async ({ page }) => {
        await page.goto('/session/h-aria-moon/review');
        const submitBtn = page.locator('button[type="submit"]', { hasText: 'Submit reflection' });
        await expect(submitBtn).toBeDisabled();
    });

    test('submitting review shows thank-you', async ({ page }) => {
        await page.goto('/session/h-aria-moon/review');

        // Rate 4 stars
        await page.locator('.star-select button').nth(3).click();

        // Submit
        await page.locator('button[type="submit"]', { hasText: 'Submit reflection' }).click();
        await expect(page.locator('text=Thank you for sharing')).toBeVisible();
    });

    test('skip review shows thank-you', async ({ page }) => {
        await page.goto('/session/h-aria-moon/review');
        await page.locator('button', { hasText: 'Skip for now' }).click();
        await expect(page.locator('text=Thank you for sharing')).toBeVisible();
    });

    test('safety report link navigates to report page', async ({ page }) => {
        await page.goto('/session/h-aria-moon/review');
        const safetyLink = page.locator('a', { hasText: 'Report a safety concern' });
        await expect(safetyLink).toBeVisible();
        await safetyLink.click();
        await expect(page).toHaveURL(/\/safety-report/);
    });

    test('healer avatar and name are visible', async ({ page }) => {
        await page.goto('/session/h-aria-moon/review');
        await expect(page.locator('text=Aria Moon')).toBeVisible();
        await expect(page.locator('text=How was your session?')).toBeVisible();
    });

    test('invalid healer on review page shows not-found', async ({ page }) => {
        await page.goto('/session/h-fake-id/review');
        await expect(page.locator('text=Session not found')).toBeVisible();
    });
});

test.describe('Safety Report Page', () => {

    test('shows report categories', async ({ page }) => {
        await page.goto('/session/h-aria-moon/safety-report');
        await expect(page.locator('text=Inappropriate behavior')).toBeVisible();
        await expect(page.locator('text=I felt unsafe')).toBeVisible();
        await expect(page.locator('text=No-show')).toBeVisible();
    });

    test('submit is blocked without selecting a category', async ({ page }) => {
        await page.goto('/session/h-aria-moon/safety-report');
        const submitBtn = page.locator('button[type="submit"]');
        // Submit button should be disabled when no category selected
        await expect(submitBtn).toBeDisabled();
    });

    test('selecting category and submitting shows confirmation', async ({ page }) => {
        await page.goto('/session/h-aria-moon/safety-report');

        // Click a category
        await page.locator('.duration-option', { hasText: 'No-show' }).click();

        // Fill description
        const textarea = page.locator('textarea');
        if (await textarea.isVisible()) {
            await textarea.fill('The healer did not show up for the session.');
        }

        // Submit
        const submitBtn = page.locator('button[type="submit"]');
        await submitBtn.click();

        // Should show confirmation heading
        await expect(page.locator('h2', { hasText: 'Report received' })).toBeVisible({ timeout: 3000 });
    });
});
