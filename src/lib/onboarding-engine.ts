/**
 * Onboarding Engine — Pure Functions for Healer Registration
 *
 * All functions are stateless and side-effect-free.
 * Cyclomatic complexity target: ≤ 3 per function.
 */
import {
    type HealerApplication,
    type OnboardingStep,
    type StepValidationResult,
    type PractitionerType,
    ONBOARDING_STEPS,
} from './onboarding-types';

// ─── Prohibited Terms (German + English) ─────────────────────────────────

const PROHIBITED_PATTERNS: RegExp[] = [
    /\bheil(e|en|t|ung)\b/i,
    /\btherapie\b/i,
    /\btherapy\b/i,
    /\bbehandl(e|en|t|ung)\b/i,
    /\bdiagnos(e|en|tik)\b/i,
    /\bcure[sd]?\b/i,
    /\btreat(s|ed|ing|ment)?\b/i,
    /\bdiagnos(e[sd]?|ing|is)\b/i,
];

// ─── Step Validators ─────────────────────────────────────────────────────

function validateProfile(app: HealerApplication): StepValidationResult {
    const errors: string[] = [];
    if (!app.profile.fullName.trim()) errors.push('Full name is required');
    if (app.profile.bio.length < 50) errors.push('Bio must be at least 50 characters');
    if (app.profile.languages.length === 0) errors.push('At least one language is required');
    return { valid: errors.length === 0, errors };
}

function validateModalities(app: HealerApplication): StepValidationResult {
    const errors: string[] = [];
    if (app.modalities.length === 0) errors.push('Select at least one modality');
    return { valid: errors.length === 0, errors };
}

function validateCredentials(_app: HealerApplication): StepValidationResult {
    return { valid: true, errors: [] };
}

function validateLegal(app: HealerApplication): StepValidationResult {
    const errors: string[] = [];
    const hasHP = app.legal.type === 'heilpraktiker' && !!app.legal.hpLicenseNumber;
    const hasDisclaimer = app.legal.type === 'wellness-practitioner' && app.legal.disclaimerAccepted;
    if (!hasHP && !hasDisclaimer) {
        errors.push('Please provide an HP license number or confirm the wellness practitioner agreement');
    }
    return { valid: errors.length === 0, errors };
}

function validateSocial(_app: HealerApplication): StepValidationResult {
    return { valid: true, errors: [] };
}

function validateReview(app: HealerApplication): StepValidationResult {
    const requiredSteps: OnboardingStep[] = ['profile', 'modalities', 'legal'];
    const errors: string[] = [];
    for (const step of requiredSteps) {
        const result = validateStep(app, step);
        if (!result.valid) errors.push(`Step "${step}" is incomplete`);
    }
    return { valid: errors.length === 0, errors };
}

const STEP_VALIDATORS: Record<OnboardingStep, (app: HealerApplication) => StepValidationResult> = {
    profile: validateProfile,
    modalities: validateModalities,
    credentials: validateCredentials,
    legal: validateLegal,
    social: validateSocial,
    review: validateReview,
};

// ─── Public API ──────────────────────────────────────────────────────────

export function validateStep(app: HealerApplication, step: OnboardingStep): StepValidationResult {
    return STEP_VALIDATORS[step](app);
}

export function canAdvance(app: HealerApplication, currentStep: OnboardingStep): boolean {
    if (currentStep === 'review') return false;
    return validateStep(app, currentStep).valid;
}

export function computeCompleteness(app: HealerApplication): number {
    const checks = [
        app.profile.fullName.trim().length > 0,
        app.profile.bio.length >= 50,
        app.profile.languages.length > 0,
        app.modalities.length > 0,
        app.credentials.length > 0,
        app.legal.type !== 'none',
        !!app.social.instagramHandle,
        !!app.social.websiteUrl,
    ];
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
}

export function classifyPractitioner(app: HealerApplication): PractitionerType {
    if (app.legal.type === 'heilpraktiker' && app.legal.hpLicenseNumber) return 'heilpraktiker';
    if (app.legal.type === 'wellness-practitioner' && app.legal.disclaimerAccepted) return 'wellness-practitioner';
    return 'unclassified';
}

export function flagProhibitedTerms(text: string): { clean: boolean; flagged: string[] } {
    const flagged: string[] = [];
    for (const pattern of PROHIBITED_PATTERNS) {
        const match = text.match(pattern);
        if (match) flagged.push(match[0]);
    }
    return { clean: flagged.length === 0, flagged };
}

export function generateDisclaimerText(
    practitionerType: PractitionerType,
    locale: 'de' | 'en' = 'de',
): string {
    if (practitionerType === 'unclassified') return '';

    if (practitionerType === 'heilpraktiker') {
        return locale === 'de'
            ? 'Dieser Anbieter ist ein staatlich geprüfter Heilpraktiker.'
            : 'This practitioner is a state-certified Heilpraktiker (alternative medicine practitioner).';
    }

    return locale === 'de'
        ? 'Dieser Anbieter ist kein Heilpraktiker und bietet keine medizinische Behandlung an. Die angebotenen Leistungen dienen der Entspannung und dem Wohlbefinden.'
        : 'This practitioner offers holistic wellness facilitation for personal growth and well-being. Sessions are not intended as a substitute for professional medical or psychological services.';
}
