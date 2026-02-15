/**
 * Onboarding Types — HoldSpace Healer Registration
 *
 * Defines the data structures for the multi-step healer onboarding flow.
 * Supports Germany-specific practitioner classification (Heilpraktiker vs Wellness).
 */

export const ONBOARDING_STEPS = [
    'profile',
    'modalities',
    'credentials',
    'legal',
    'social',
    'review',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface HealerProfile {
    fullName: string;
    bio: string;
    languages: string[];
    avatarUrl: string;
}

export interface CredentialEntry {
    name: string;
    issuer: string;
    year: number;
}

export type PractitionerType = 'heilpraktiker' | 'wellness-practitioner' | 'unclassified';

export interface LegalSection {
    type: 'heilpraktiker' | 'wellness-practitioner' | 'none';
    hpLicenseNumber: string | null;
    disclaimerAccepted: boolean;
}

export interface SocialSection {
    instagramHandle: string | null;
    websiteUrl: string | null;
}

export interface HealerApplication {
    profile: HealerProfile;
    modalities: string[];
    credentials: CredentialEntry[];
    legal: LegalSection;
    social: SocialSection;
}

export interface StepValidationResult {
    valid: boolean;
    errors: string[];
}
