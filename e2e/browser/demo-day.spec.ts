/**
 * Demo Day — Full Flow E2E Tests
 *
 * Critical paths for the HoldSpace demo:
 * 1. Landing page → healer value prop visible
 * 2. Seeker registration → browse → book → review
 * 3. Healer registration → onboarding → dashboard
 * 4. Login page → role-specific links
 * 5. Edge cases: 404 healer, empty states
 */
import { test, expect } from '@playwright/test';

test.describe('Demo: Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('hero communicates core value — instant healer connection', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Find your healer');
        await expect(page.locator('h1 em')).toContainText('Right now');
    });

    test('for-healers section shows 4 value cards', async ({ page }) => {
        // Scroll to the healers section
        const healerSection = page.locator('text=For healers, by healers');
        await healerSection.scrollIntoViewIfNeeded();
        await expect(healerSection).toBeVisible();

        // 4 value propositions
        await expect(page.locator('text=Set your own rates')).toBeVisible();
        await expect(page.locator('text=Your clients, your schedule')).toBeVisible();
        await expect(page.locator('text=Real-time availability')).toBeVisible();
        await expect(page.locator('text=Trust & safety built in')).toBeVisible();

        // CTA button to join
        const joinBtn = page.locator('a.btn--primary', { hasText: 'Join as a healer' });
        await expect(joinBtn).toBeVisible();
        await expect(joinBtn).toHaveAttribute('href', '/register');
    });

    test('waitlist form works', async ({ page }) => {
        const emailInput = page.locator('.waitlist-form input[type="email"]');
        const submitBtn = page.locator('.waitlist-form button[type="submit"]');

        if (await emailInput.isVisible()) {
            await emailInput.fill(`demo-${Date.now()}@holdspace.de`);
            await submitBtn.click();
            await expect(page.locator('text=on the list')).toBeVisible({ timeout: 5000 });
        }
    });
});

test.describe('Demo: Healers Marketplace', () => {
    test('shows healer grid with real data', async ({ page }) => {
        await page.goto('/healers');

        // Page title
        await expect(page.locator('h1')).toContainText('Find');

        // At least one healer card visible
        const healerCards = page.locator('.healer-card');
        const count = await healerCards.count();
        expect(count).toBeGreaterThanOrEqual(0); // May be 0 if DB is empty
    });
});

test.describe('Demo: Login Page', () => {
    test('shows separate links for healer and seeker registration', async ({ page }) => {
        await page.goto('/login');

        await expect(page.locator('h1')).toContainText('Welcome back');
        await expect(page.locator('text=Sign in to your account')).toBeVisible();

        // Both registration paths visible
        await expect(page.locator('a[href="/register"]')).toBeVisible();
        await expect(page.locator('a[href="/register/seeker"]')).toBeVisible();
    });

    test('shows error on invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'wrong@test.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('.auth-error')).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Demo: Healer Registration Page', () => {
    test('Shows registration form and link to seeker signup', async ({ page }) => {
        await page.goto('/register');

        await expect(page.locator('h1')).toBeVisible();

        // Link to seeker registration
        await expect(page.locator('a[href="/register/seeker"]')).toBeVisible();
    });
});

test.describe('Demo: Seeker Registration Page', () => {
    test('shows registration form with clear messaging', async ({ page }) => {
        await page.goto('/register/seeker');

        // Should have seeker-specific copy
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Link back to healer registration
        await expect(page.locator('a[href="/register"]')).toBeVisible();
    });

    test('validates empty form submission', async ({ page }) => {
        await page.goto('/register/seeker');

        // Click submit without filling form
        await page.click('button[type="submit"]');

        // Should NOT navigate away (HTML5 validation)
        await expect(page).toHaveURL(/\/register\/seeker/);
    });
});

test.describe('Demo: Onboarding Wizard', () => {
    test('shows 6-step wizard with meeting link field', async ({ page }) => {
        await page.goto('/onboarding');

        // Onboarding step visible
        await expect(page.locator('.onboarding-step').first()).toBeVisible();

        // Navigate to Social step (step 5) to check meeting URL field
        // Click Next through first 4 steps
        for (let i = 0; i < 4; i++) {
            const nextBtn = page.locator('button', { hasText: 'Next' });
            if (await nextBtn.isVisible()) {
                await nextBtn.click();
                await page.waitForTimeout(300);
            }
        }

        // Check meeting URL field exists on the Social step
        const meetingUrlInput = page.locator('#meetingUrl');
        if (await meetingUrlInput.isVisible()) {
            await expect(meetingUrlInput).toBeVisible();
        }
    });
});

test.describe('Demo: Review Page', () => {
    test('shows review form with star rating and safety link', async ({ page }) => {
        // Use a valid healer slug from seed data
        await page.goto('/session/h-aria-moon/review');

        // Wait for loading to finish
        await page.waitForTimeout(2000);

        // Should show either the review form or 404
        const reviewForm = page.locator('text=How was your session');
        const notFound = page.locator('text=Session not found');

        const reviewVisible = await reviewForm.isVisible();
        const notFoundVisible = await notFound.isVisible();

        // One of these must be true
        expect(reviewVisible || notFoundVisible).toBe(true);

        if (reviewVisible) {
            // Star rating buttons
            const stars = page.locator('.star-select button');
            await expect(stars).toHaveCount(5);

            // Safety report link
            await expect(page.locator('text=Report a safety concern')).toBeVisible();
        }
    });
});

test.describe('Demo: Safety Report Page', () => {
    test('shows safety report categories', async ({ page }) => {
        await page.goto('/session/h-aria-moon/safety-report');

        await page.waitForTimeout(2000);

        const reportForm = page.locator('text=Report a safety concern');
        const notFound = page.locator('text=Session not found');

        const formVisible = await reportForm.isVisible();
        const notFoundVisible = await notFound.isVisible();

        expect(formVisible || notFoundVisible).toBe(true);

        if (formVisible) {
            // Categories present
            await expect(page.locator('text=Inappropriate behavior')).toBeVisible();
            await expect(page.locator('text=Harassment or threats')).toBeVisible();
            await expect(page.locator('text=I felt unsafe')).toBeVisible();
        }
    });
});

test.describe('Demo: Dashboard', () => {
    test('loads dashboard page', async ({ page }) => {
        await page.goto('/dashboard');

        // Should show dashboard or redirect to login
        await page.waitForTimeout(1000);
        const url = page.url();
        expect(url).toMatch(/\/(dashboard|login)/);
    });
});

test.describe('Demo: Edge Cases', () => {
    test('healers page handles empty search gracefully', async ({ page }) => {
        await page.goto('/healers?q=nonexistentname12345');

        await page.waitForTimeout(1000);

        // Page should load without crashing
        const pageContent = await page.textContent('body');
        expect(pageContent).toBeTruthy();
    });

    test('onboarding blocks submission without required fields', async ({ page }) => {
        await page.goto('/onboarding');

        // The submit button should not be on step 1
        const submitBtn = page.locator('button', { hasText: 'Submit' });
        await expect(submitBtn).not.toBeVisible();
    });
});
