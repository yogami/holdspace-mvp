/**
 * Onboarding Engine — TDD Specs (Written BEFORE Implementation)
 *
 * Tests the pure-function onboarding logic for healer registration.
 * Covers: step validation, advancement rules, completeness scoring,
 * practitioner classification (HP vs wellness), prohibited term detection,
 * and locale-aware disclaimer generation.
 */
import { test, expect } from '@playwright/test';

// --- Types will be created in onboarding-types.ts ---
import {
    type HealerApplication,
    type OnboardingStep,
    ONBOARDING_STEPS,
} from '@/lib/onboarding-types';

// --- Functions will be created in onboarding-engine.ts ---
import {
    validateStep,
    canAdvance,
    computeCompleteness,
    classifyPractitioner,
    generateDisclaimerText,
    flagProhibitedTerms,
} from '@/lib/onboarding-engine';

// ─── Fixtures ────────────────────────────────────────────────────────────

function makeEmptyApplication(): HealerApplication {
    return {
        profile: { fullName: '', bio: '', languages: [], avatarUrl: '' },
        modalities: [],
        credentials: [],
        legal: { type: 'none', hpLicenseNumber: null, disclaimerAccepted: false },
        social: { instagramHandle: null, websiteUrl: null },
    };
}

function makeCompleteApplication(): HealerApplication {
    return {
        profile: {
            fullName: 'Aria Moon',
            bio: 'Ich begleite dich auf deinem Weg zu mehr Körperbewusstsein.',
            languages: ['Deutsch', 'English'],
            avatarUrl: 'https://example.com/aria.jpg',
        },
        modalities: ['breathwork', 'somatic-movement'],
        credentials: [
            {
                name: 'Holotropic Breathwork Facilitator',
                issuer: 'Grof Transpersonal Training',
                year: 2019,
            },
        ],
        legal: { type: 'wellness-practitioner', hpLicenseNumber: null, disclaimerAccepted: true },
        social: { instagramHandle: '@ariamoon_breathwork', websiteUrl: 'https://ariamoon.de' },
    };
}

function makeHPApplication(): HealerApplication {
    return {
        ...makeCompleteApplication(),
        legal: {
            type: 'heilpraktiker',
            hpLicenseNumber: 'HP-2024-BER-12345',
            disclaimerAccepted: false, // HP doesn't need disclaimer
        },
    };
}

// ─── validateStep ────────────────────────────────────────────────────────

test.describe('validateStep', () => {
    test('profile step requires fullName, bio ≥ 50 chars, and at least 1 language', () => {
        const app = makeEmptyApplication();
        const result = validateStep(app, 'profile');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Full name is required');
        expect(result.errors).toContain('Bio must be at least 50 characters');
        expect(result.errors).toContain('At least one language is required');
    });

    test('profile step passes with valid data', () => {
        const app = makeCompleteApplication();
        const result = validateStep(app, 'profile');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('modalities step requires at least 1 modality', () => {
        const app = makeEmptyApplication();
        const result = validateStep(app, 'modalities');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Select at least one modality');
    });

    test('modalities step passes with selections', () => {
        const app = makeCompleteApplication();
        const result = validateStep(app, 'modalities');
        expect(result.valid).toBe(true);
    });

    test('credentials step passes even with no credentials (optional)', () => {
        const app = makeEmptyApplication();
        const result = validateStep(app, 'credentials');
        expect(result.valid).toBe(true);
    });

    test('legal step fails if neither HP license nor disclaimer accepted', () => {
        const app = makeEmptyApplication();
        const result = validateStep(app, 'legal');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('You must either provide an HP license or accept the non-clinical disclaimer');
    });

    test('legal step passes with HP license', () => {
        const app = makeHPApplication();
        const result = validateStep(app, 'legal');
        expect(result.valid).toBe(true);
    });

    test('legal step passes with disclaimer accepted', () => {
        const app = makeCompleteApplication();
        const result = validateStep(app, 'legal');
        expect(result.valid).toBe(true);
    });

    test('social step always passes (optional)', () => {
        const app = makeEmptyApplication();
        const result = validateStep(app, 'social');
        expect(result.valid).toBe(true);
    });

    test('review step passes when all required steps are valid', () => {
        const app = makeCompleteApplication();
        const result = validateStep(app, 'review');
        expect(result.valid).toBe(true);
    });

    test('review step fails when prior steps are incomplete', () => {
        const app = makeEmptyApplication();
        const result = validateStep(app, 'review');
        expect(result.valid).toBe(false);
    });
});

// ─── canAdvance ──────────────────────────────────────────────────────────

test.describe('canAdvance', () => {
    test('can advance from valid profile step', () => {
        const app = makeCompleteApplication();
        expect(canAdvance(app, 'profile')).toBe(true);
    });

    test('cannot advance from invalid profile step', () => {
        const app = makeEmptyApplication();
        expect(canAdvance(app, 'profile')).toBe(false);
    });

    test('cannot advance from review (it is the last step)', () => {
        const app = makeCompleteApplication();
        expect(canAdvance(app, 'review')).toBe(false);
    });
});

// ─── computeCompleteness ─────────────────────────────────────────────────

test.describe('computeCompleteness', () => {
    test('empty application = 0%', () => {
        const app = makeEmptyApplication();
        expect(computeCompleteness(app)).toBe(0);
    });

    test('fully complete application = 100%', () => {
        const app = makeCompleteApplication();
        expect(computeCompleteness(app)).toBe(100);
    });

    test('partial application gives a value between 0 and 100', () => {
        const app = makeEmptyApplication();
        app.profile.fullName = 'Test Healer';
        app.profile.bio = 'A bio that is at least fifty characters long for validation purposes here.';
        app.profile.languages = ['English'];
        const pct = computeCompleteness(app);
        expect(pct).toBeGreaterThan(0);
        expect(pct).toBeLessThan(100);
    });
});

// ─── classifyPractitioner ────────────────────────────────────────────────

test.describe('classifyPractitioner', () => {
    test('application with HP license → heilpraktiker', () => {
        const app = makeHPApplication();
        expect(classifyPractitioner(app)).toBe('heilpraktiker');
    });

    test('application with disclaimer only → wellness-practitioner', () => {
        const app = makeCompleteApplication();
        expect(classifyPractitioner(app)).toBe('wellness-practitioner');
    });

    test('empty legal section → unclassified', () => {
        const app = makeEmptyApplication();
        expect(classifyPractitioner(app)).toBe('unclassified');
    });
});

// ─── flagProhibitedTerms ─────────────────────────────────────────────────

test.describe('flagProhibitedTerms', () => {
    test('clean text returns no flags', () => {
        const result = flagProhibitedTerms('Ich begleite dich bei der Nervensystem-Regulation.');
        expect(result.clean).toBe(true);
        expect(result.flagged).toHaveLength(0);
    });

    test('German prohibited terms are caught', () => {
        const result = flagProhibitedTerms('Ich heile deine Angststörung durch Therapie.');
        expect(result.clean).toBe(false);
        expect(result.flagged).toContain('heile');
        expect(result.flagged).toContain('Therapie');
    });

    test('English prohibited terms are caught', () => {
        const result = flagProhibitedTerms('I will cure your depression and treat your anxiety.');
        expect(result.clean).toBe(false);
        expect(result.flagged).toContain('cure');
        expect(result.flagged).toContain('treat');
    });

    test('"diagnose" and "Behandlung" are flagged', () => {
        const result = flagProhibitedTerms('Diagnose und Behandlung von Krankheiten.');
        expect(result.clean).toBe(false);
        expect(result.flagged).toContain('Diagnose');
        expect(result.flagged).toContain('Behandlung');
    });

    test('safe wellness terms are NOT flagged', () => {
        const result = flagProhibitedTerms(
            'Breathwork practice for relaxation. Somatic movement for body awareness. Unterstützung für dein Wohlbefinden.'
        );
        expect(result.clean).toBe(true);
    });

    test('case-insensitive matching', () => {
        const result = flagProhibitedTerms('HEILUNG durch THERAPIE');
        expect(result.clean).toBe(false);
        expect(result.flagged.length).toBeGreaterThanOrEqual(2);
    });
});

// ─── generateDisclaimerText ──────────────────────────────────────────────

test.describe('generateDisclaimerText', () => {
    test('wellness practitioner gets non-clinical disclaimer in German', () => {
        const text = generateDisclaimerText('wellness-practitioner', 'de');
        expect(text).toContain('kein Heilpraktiker');
        expect(text).toContain('keine medizinische');
    });

    test('wellness practitioner gets non-clinical disclaimer in English', () => {
        const text = generateDisclaimerText('wellness-practitioner', 'en');
        expect(text).toContain('not a licensed');
        expect(text).toContain('not medical');
    });

    test('heilpraktiker gets HP-specific disclaimer', () => {
        const text = generateDisclaimerText('heilpraktiker', 'de');
        expect(text).toContain('Heilpraktiker');
        expect(text).not.toContain('kein Heilpraktiker');
    });

    test('unclassified type returns empty string', () => {
        const text = generateDisclaimerText('unclassified', 'de');
        expect(text).toBe('');
    });
});
