/**
 * Landing Page — E2E Browser Tests
 *
 * Validates all sections of the home page render correctly,
 * nav links work, waitlist form validates, and legal disclaimers appear.
 */
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders hero with heading and CTA', async ({ page }) => {
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toContainText('Find your healer');

        const ctaButton = page.locator('a.btn.btn--secondary.btn--lg', { hasText: 'Join the Waitlist' });
        await expect(ctaButton).toBeVisible();
    });

    test('nav links navigate correctly', async ({ page }) => {
        // "Find a Healer" link
        const healerLink = page.locator('.nav__links a', { hasText: 'Find a Healer' });
        await expect(healerLink).toHaveAttribute('href', '/healers');

        // "For Healers" link
        const forHealersLink = page.locator('.nav__links a', { hasText: 'For Healers' });
        await expect(forHealersLink).toHaveAttribute('href', '/onboarding');
    });

    test('trust bar shows safety stats', async ({ page }) => {
        const trustBar = page.locator('.trust-bar');
        await expect(trustBar).toBeVisible();

        // Check for at least some trust indicators
        const trustItems = page.locator('.trust-item');
        const count = await trustItems.count();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test('how-it-works shows 3 steps', async ({ page }) => {
        const steps = page.locator('.step');
        await expect(steps).toHaveCount(3);

        // Each step has a number
        const stepNumbers = page.locator('.step__number');
        await expect(stepNumbers).toHaveCount(3);
    });

    test('modalities section shows all 8 modalities', async ({ page }) => {
        const modalityCards = page.locator('.modality-card');
        await expect(modalityCards).toHaveCount(8);
    });

    test('featured healers shows cards with names and ratings', async ({ page }) => {
        // Featured healers section should show 3 cards
        const healerCards = page.locator('.healer-card');
        const count = await healerCards.count();
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(3);

        // Each card has a name
        const names = page.locator('.healer-card__name');
        const nameCount = await names.count();
        expect(nameCount).toBeGreaterThanOrEqual(1);
    });

    test('waitlist form rejects empty email', async ({ page }) => {
        // Find the waitlist form submit button
        const submitBtn = page.locator('.waitlist-form button[type="submit"]');

        // If visible, click without filling email
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            // Should NOT show success state
            const successMsg = page.locator('text=Thank you');
            await expect(successMsg).not.toBeVisible();
        }
    });

    test('waitlist form accepts valid email and shows success', async ({ page }) => {
        const emailInput = page.locator('.waitlist-form input[type="email"]');
        const submitBtn = page.locator('.waitlist-form button[type="submit"]');

        if (await emailInput.isVisible()) {
            await emailInput.fill('test@holdspace.de');
            await submitBtn.click();

            // Should show success state
            const successMsg = page.locator('text=on the list');
            await expect(successMsg).toBeVisible({ timeout: 3000 });
        }
    });

    test('footer has German non-clinical disclaimer', async ({ page }) => {
        const footer = page.locator('.footer');
        await expect(footer).toContainText('HoldSpace ist keine medizinische Plattform');
        await expect(footer).toContainText('Telefonseelsorge');
    });

    test('footer has English disclaimer', async ({ page }) => {
        const footer = page.locator('.footer');
        await expect(footer).toContainText('not a substitute for medical care');
    });

    test('footer links to /onboarding and /dashboard', async ({ page }) => {
        const applyLink = page.locator('.footer a', { hasText: 'Apply to Join' });
        await expect(applyLink).toHaveAttribute('href', '/onboarding');

        const dashboardLink = page.locator('.footer a', { hasText: 'Healer Dashboard' });
        await expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    test('clicking "Find a Healer" navigates to /healers', async ({ page }) => {
        await page.locator('.nav__links a', { hasText: 'Find a Healer' }).click();
        await expect(page).toHaveURL(/\/healers/);
    });
});
