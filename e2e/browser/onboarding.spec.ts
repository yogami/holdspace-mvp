/**
 * Onboarding Wizard — E2E Browser Tests
 *
 * Validates the 6-step onboarding flow: step navigation, validation,
 * prohibited terms, practitioner classification, and full-flow submission.
 */
import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/onboarding');
    });

    test('renders step indicator with 6 steps', async ({ page }) => {
        const steps = page.locator('.step-indicator__item');
        await expect(steps).toHaveCount(6);

        // Check step labels
        await expect(page.locator('.step-indicator__label', { hasText: 'Profile' })).toBeVisible();
        await expect(page.locator('.step-indicator__label', { hasText: 'Review' })).toBeVisible();
    });

    test('starts on Profile step with step 1 active', async ({ page }) => {
        // Step 1 is active
        const activeStep = page.locator('.step-indicator__item--active');
        await expect(activeStep).toHaveCount(1);

        // Profile content visible
        await expect(page.locator('h2', { hasText: 'Profile' })).toBeVisible();
        await expect(page.locator('label', { hasText: 'Full Name' })).toBeVisible();
    });

    test('profile completeness starts at 0%', async ({ page }) => {
        await expect(page.locator('.onboarding-progress-pct')).toContainText('0%');
    });

    test('Continue is disabled without required fields', async ({ page }) => {
        const continueBtn = page.locator('button', { hasText: 'Continue →' });
        await expect(continueBtn).toBeDisabled();
    });

    test('filling profile fields enables Continue', async ({ page }) => {
        // Fill name
        await page.locator('#fullName').fill('Test Healer');

        // Fill bio (>= 50 chars)
        await page.locator('#bio').fill('I am a passionate wellness facilitator helping seekers find inner peace and balance.');

        // Select a language
        await page.locator('.chip', { hasText: 'English' }).click();

        // Continue should now be enabled
        const continueBtn = page.locator('button', { hasText: 'Continue →' });
        await expect(continueBtn).toBeEnabled();
    });

    test('navigating to Modalities step', async ({ page }) => {
        // Fill profile
        await page.locator('#fullName').fill('Test Healer');
        await page.locator('#bio').fill('I am a passionate wellness facilitator helping seekers find inner peace and balance.');
        await page.locator('.chip', { hasText: 'German' }).click();

        // Click Continue
        await page.locator('button', { hasText: 'Continue →' }).click();

        // Should be on Modalities step
        await expect(page.locator('h2', { hasText: 'Modalities' })).toBeVisible();
    });

    test('selecting modalities shows checkmarks', async ({ page }) => {
        // Navigate to Modalities step via step indicator
        await page.locator('.step-indicator__item', { hasText: 'Modalities' }).click();

        // Click a modality card
        await page.locator('.modality-select-card', { hasText: 'Breathwork' }).click();
        await expect(page.locator('.modality-select-card__check')).toBeVisible();

        // Click another
        await page.locator('.modality-select-card', { hasText: 'Sound Healing' }).click();
        const checks = page.locator('.modality-select-card__check');
        await expect(checks).toHaveCount(2);
    });

    test('credentials step allows adding and removing credentials', async ({ page }) => {
        // Navigate to Credentials step
        await page.locator('.step-indicator__item', { hasText: 'Credentials' }).click();

        // Initially no credentials
        const cards = page.locator('.credential-card');
        await expect(cards).toHaveCount(0);

        // Add a credential
        await page.locator('button', { hasText: '+ Add Credential' }).click();
        await expect(page.locator('.credential-card')).toHaveCount(1);

        // Remove it
        await page.locator('.credential-card__remove').click();
        await expect(page.locator('.credential-card')).toHaveCount(0);
    });

    test('legal step shows two practitioner options', async ({ page }) => {
        // Navigate to Legal step
        await page.locator('.step-indicator__item', { hasText: 'Legal' }).click();

        const options = page.locator('.legal-option');
        await expect(options).toHaveCount(2);
        await expect(page.locator('.legal-option__title', { hasText: 'Heilpraktiker' })).toBeVisible();
        await expect(page.locator('.legal-option__title', { hasText: 'Wellness Facilitator' })).toBeVisible();
    });

    test('wellness-practitioner shows German disclaimer and checkbox', async ({ page }) => {
        await page.locator('.step-indicator__item', { hasText: 'Legal' }).click();

        // Click Wellness Facilitator
        await page.locator('.legal-option', { hasText: 'Wellness Facilitator' }).click();

        // Disclaimer box should appear
        await expect(page.locator('.disclaimer-box')).toBeVisible();
        await expect(page.locator('.disclaimer-checkbox')).toBeVisible();
    });

    test('heilpraktiker shows license number input', async ({ page }) => {
        await page.locator('.step-indicator__item', { hasText: 'Legal' }).click();

        // Click Heilpraktiker
        await page.locator('.legal-option', { hasText: 'Heilpraktiker' }).click();

        // HP license input should appear
        await expect(page.locator('#hpLicense')).toBeVisible();
    });

    test('social step is optional and allows advancement', async ({ page }) => {
        await page.locator('.step-indicator__item', { hasText: 'Social' }).click();

        await expect(page.locator('#instagram')).toBeVisible();
        await expect(page.locator('#website')).toBeVisible();

        // Continue should be enabled even without entries
        const continueBtn = page.locator('button', { hasText: 'Continue →' });
        await expect(continueBtn).toBeEnabled();
    });

    test('review step shows completeness ring', async ({ page }) => {
        await page.locator('.step-indicator__item', { hasText: 'Review' }).click();

        await expect(page.locator('.review-completeness__ring')).toBeVisible();
        await expect(page.locator('.review-summary')).toBeVisible();
    });

    test('step indicator allows jumping to any step', async ({ page }) => {
        // Jump to Legal
        await page.locator('.step-indicator__item', { hasText: 'Legal' }).click();
        await expect(page.locator('h2', { hasText: 'Legal' })).toBeVisible();

        // Jump back to Profile
        await page.locator('.step-indicator__item', { hasText: 'Profile' }).click();
        await expect(page.locator('h2', { hasText: 'Profile' })).toBeVisible();
    });

    test('prohibited terms in bio trigger warning', async ({ page }) => {
        // Fill name and a flagged bio
        await page.locator('#fullName').fill('Test Healer');
        await page.locator('#bio').fill('I offer Therapie und Diagnose for all medical conditions');

        // Warning should appear
        await expect(page.locator('.onboarding-warning')).toBeVisible();
        await expect(page.locator('.onboarding-warning')).toContainText('Flagged terms');
    });

    test('full flow: complete all steps and submit', async ({ page }) => {
        // Step 1: Profile
        await page.locator('#fullName').fill('Tessa Testperson');
        await page.locator('#bio').fill('I am a passionate wellness facilitator helping seekers find inner peace through breathwork and meditation.');
        await page.locator('.chip', { hasText: 'English' }).click();
        await page.locator('.chip', { hasText: 'German' }).click();
        await page.locator('button', { hasText: 'Continue →' }).click();

        // Step 2: Modalities
        await page.locator('.modality-select-card', { hasText: 'Breathwork' }).click();
        await page.locator('.modality-select-card', { hasText: 'Meditation' }).click();
        await page.locator('button', { hasText: 'Continue →' }).click();

        // Step 3: Credentials (optional, skip)
        await page.locator('button', { hasText: 'Continue →' }).click();

        // Step 4: Legal
        await page.locator('.legal-option', { hasText: 'Wellness Facilitator' }).click();
        await page.locator('.disclaimer-checkbox input[type="checkbox"]').check();
        await page.locator('button', { hasText: 'Continue →' }).click();

        // Step 5: Social (optional, skip)
        await page.locator('button', { hasText: 'Continue →' }).click();

        // Step 6: Review — submit
        await expect(page.locator('.review-summary')).toBeVisible();
        await page.locator('button', { hasText: 'Submit Application' }).click();

        // Success screen
        await expect(page.locator('text=Welcome to HoldSpace')).toBeVisible();
        await expect(page.locator('text=received')).toBeVisible();
    });
});
