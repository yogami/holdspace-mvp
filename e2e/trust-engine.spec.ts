/**
 * Trust Engine — TDD Specs (written BEFORE implementation)
 *
 * Tests trust score computation, tier mapping, auto-suspend logic,
 * cancellation penalties, and booking eligibility.
 */

import { test, expect } from '@playwright/test';
import {
    computeTrustScore,
    computeTrustTier,
    shouldAutoSuspend,
    getCancellationPenalty,
    canBookSession,
} from '../src/lib/trust-engine';
import type { TrustScoreInput, CancellationRecord, TrustTier } from '../src/lib/trust-types';

// ─── Factory helpers ────────────────────────────────────────────────────────

function makeInput(overrides: Partial<TrustScoreInput> = {}): TrustScoreInput {
    return {
        identityVerified: false,
        credentialsVerified: false,
        backgroundCheck: false,
        totalSessions: 0,
        avgRating: 0,
        totalReviews: 0,
        openReports: 0,
        criticalReports: 0,
        cancellationRate: 0,
        accountAgeDays: 1,
        responseTimeMinutes: 30,
        ...overrides,
    };
}

function makeCancellation(overrides: Partial<CancellationRecord> = {}): CancellationRecord {
    return {
        sessionId: 'sess-1',
        cancelledBy: 'healer',
        cancelledAt: new Date().toISOString(),
        withinGracePeriod: false,
        ...overrides,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. TRUST SCORE COMPUTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('computeTrustScore', () => {
    test('brand new healer with no verification = low score', () => {
        const score = computeTrustScore(makeInput());
        expect(score).toBeGreaterThanOrEqual(0);
        // Gets ~28 from safety baseline (100*0.2) + partial reliability
        expect(score).toBeLessThan(35);
    });

    test('fully verified healer with zero sessions gets verification credit', () => {
        const score = computeTrustScore(makeInput({
            identityVerified: true,
            credentialsVerified: true,
            backgroundCheck: true,
        }));
        // Verification (25pts full) + safety baseline + partial reliability
        expect(score).toBeGreaterThanOrEqual(40);
        expect(score).toBeLessThan(60);
    });

    test('established healer with good stats gets high score', () => {
        const score = computeTrustScore(makeInput({
            identityVerified: true,
            credentialsVerified: true,
            backgroundCheck: true,
            totalSessions: 100,
            avgRating: 4.8,
            totalReviews: 80,
            openReports: 0,
            criticalReports: 0,
            cancellationRate: 0.02,
            accountAgeDays: 365,
            responseTimeMinutes: 5,
        }));
        expect(score).toBeGreaterThanOrEqual(80);
        expect(score).toBeLessThanOrEqual(100);
    });

    test('high cancellation rate significantly reduces score', () => {
        const goodScore = computeTrustScore(makeInput({
            identityVerified: true,
            credentialsVerified: true,
            totalSessions: 50,
            avgRating: 4.5,
            totalReviews: 40,
            cancellationRate: 0.02,
            accountAgeDays: 180,
        }));

        const badScore = computeTrustScore(makeInput({
            identityVerified: true,
            credentialsVerified: true,
            totalSessions: 50,
            avgRating: 4.5,
            totalReviews: 40,
            cancellationRate: 0.40,
            accountAgeDays: 180,
        }));

        expect(goodScore).toBeGreaterThan(badScore);
        expect(goodScore - badScore).toBeGreaterThan(3);
    });

    test('open reports reduce score', () => {
        const cleanScore = computeTrustScore(makeInput({
            identityVerified: true,
            totalSessions: 30,
            avgRating: 4.5,
            totalReviews: 25,
            openReports: 0,
            criticalReports: 0,
            accountAgeDays: 90,
        }));

        const reportedScore = computeTrustScore(makeInput({
            identityVerified: true,
            totalSessions: 30,
            avgRating: 4.5,
            totalReviews: 25,
            openReports: 2,
            criticalReports: 1,
            accountAgeDays: 90,
        }));

        expect(cleanScore).toBeGreaterThan(reportedScore);
    });

    test('score is always clamped between 0 and 100', () => {
        const worst = computeTrustScore(makeInput({
            openReports: 10,
            criticalReports: 5,
            cancellationRate: 1.0,
        }));
        expect(worst).toBeGreaterThanOrEqual(0);
        expect(worst).toBeLessThanOrEqual(100);

        const best = computeTrustScore(makeInput({
            identityVerified: true,
            credentialsVerified: true,
            backgroundCheck: true,
            totalSessions: 1000,
            avgRating: 5.0,
            totalReviews: 800,
            openReports: 0,
            criticalReports: 0,
            cancellationRate: 0,
            accountAgeDays: 1000,
            responseTimeMinutes: 1,
        }));
        expect(best).toBeLessThanOrEqual(100);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. TRUST TIER MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('computeTrustTier', () => {
    test('score 0-29 = new', () => {
        expect(computeTrustTier(0)).toBe('new');
        expect(computeTrustTier(15)).toBe('new');
        expect(computeTrustTier(29)).toBe('new');
    });

    test('score 30-59 = verified', () => {
        expect(computeTrustTier(30)).toBe('verified');
        expect(computeTrustTier(45)).toBe('verified');
        expect(computeTrustTier(59)).toBe('verified');
    });

    test('score 60-84 = established', () => {
        expect(computeTrustTier(60)).toBe('established');
        expect(computeTrustTier(72)).toBe('established');
        expect(computeTrustTier(84)).toBe('established');
    });

    test('score 85-100 = trusted', () => {
        expect(computeTrustTier(85)).toBe('trusted');
        expect(computeTrustTier(92)).toBe('trusted');
        expect(computeTrustTier(100)).toBe('trusted');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. AUTO-SUSPEND LOGIC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('shouldAutoSuspend', () => {
    test('0 critical reports → no suspend', () => {
        expect(shouldAutoSuspend([])).toBe(false);
    });

    test('2 critical reports → no suspend', () => {
        const reports = [
            { severity: 'critical' as const, status: 'open' as const },
            { severity: 'critical' as const, status: 'open' as const },
        ];
        expect(shouldAutoSuspend(reports)).toBe(false);
    });

    test('3 critical open reports → auto-suspend', () => {
        const reports = [
            { severity: 'critical' as const, status: 'open' as const },
            { severity: 'critical' as const, status: 'open' as const },
            { severity: 'critical' as const, status: 'open' as const },
        ];
        expect(shouldAutoSuspend(reports)).toBe(true);
    });

    test('resolved critical reports do NOT count', () => {
        const reports = [
            { severity: 'critical' as const, status: 'resolved' as const },
            { severity: 'critical' as const, status: 'resolved' as const },
            { severity: 'critical' as const, status: 'open' as const },
        ];
        expect(shouldAutoSuspend(reports)).toBe(false);
    });

    test('non-critical reports do NOT trigger suspend', () => {
        const reports = [
            { severity: 'high' as const, status: 'open' as const },
            { severity: 'high' as const, status: 'open' as const },
            { severity: 'high' as const, status: 'open' as const },
            { severity: 'high' as const, status: 'open' as const },
        ];
        expect(shouldAutoSuspend(reports)).toBe(false);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. CANCELLATION PENALTY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('getCancellationPenalty', () => {
    test('no cancellations → no penalty', () => {
        expect(getCancellationPenalty([])).toBe('none');
    });

    test('1 late cancellation → warning', () => {
        const records = [makeCancellation()];
        expect(getCancellationPenalty(records)).toBe('warning');
    });

    test('cancellation within grace period → no penalty', () => {
        const records = [makeCancellation({ withinGracePeriod: true })];
        expect(getCancellationPenalty(records)).toBe('none');
    });

    test('3 late cancellations → cooldown', () => {
        const records = Array.from({ length: 3 }, () => makeCancellation());
        expect(getCancellationPenalty(records)).toBe('cooldown');
    });

    test('5+ late cancellations → suspension', () => {
        const records = Array.from({ length: 5 }, () => makeCancellation());
        expect(getCancellationPenalty(records)).toBe('suspension');
    });

    test('mix of grace-period and late cancellations', () => {
        const records = [
            makeCancellation({ withinGracePeriod: true }),
            makeCancellation({ withinGracePeriod: true }),
            makeCancellation({ withinGracePeriod: false }),
            makeCancellation({ withinGracePeriod: false }),
        ];
        // Only 2 late cancellations → warning
        expect(getCancellationPenalty(records)).toBe('warning');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. BOOKING ELIGIBILITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('canBookSession', () => {
    test('new seeker CAN book established healer', () => {
        const result = canBookSession(
            { trustTier: 'new' as TrustTier, isSuspended: false },
            { trustTier: 'established' as TrustTier, isSuspended: false, hasActiveSession: false },
        );
        expect(result.allowed).toBe(true);
    });

    test('suspended seeker CANNOT book', () => {
        const result = canBookSession(
            { trustTier: 'verified' as TrustTier, isSuspended: true },
            { trustTier: 'trusted' as TrustTier, isSuspended: false, hasActiveSession: false },
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('suspended');
    });

    test('suspended healer CANNOT be booked', () => {
        const result = canBookSession(
            { trustTier: 'verified' as TrustTier, isSuspended: false },
            { trustTier: 'trusted' as TrustTier, isSuspended: true, hasActiveSession: false },
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('suspended');
    });

    test('healer with active session CANNOT be booked', () => {
        const result = canBookSession(
            { trustTier: 'verified' as TrustTier, isSuspended: false },
            { trustTier: 'trusted' as TrustTier, isSuspended: false, hasActiveSession: true },
        );
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('session');
    });

    test('both clear → booking allowed', () => {
        const result = canBookSession(
            { trustTier: 'verified' as TrustTier, isSuspended: false },
            { trustTier: 'verified' as TrustTier, isSuspended: false, hasActiveSession: false },
        );
        expect(result.allowed).toBe(true);
    });
});
