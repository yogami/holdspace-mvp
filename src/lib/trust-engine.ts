// HoldSpace — Trust Engine
//
// Pure functions for computing trust scores, tier mapping,
// auto-suspend logic, cancellation penalties, and booking eligibility.
// All functions are stateless and deterministic for testability.

import {
    type TrustScoreInput,
    type TrustTier,
    type CancellationRecord,
    type CancellationPenalty,
    type ReportSeverity,
    type ReportStatus,
    TRUST_TIER_THRESHOLDS,
    TRUST_WEIGHTS,
    AUTO_SUSPEND_THRESHOLD,
} from './trust-types';

// ─── Trust Score Computation ────────────────────────────────────────────────

/**
 * Compute a trust score (0–100) from healer attributes.
 * Uses weighted sub-scores across verification, history, rating, safety, reliability, age.
 */
export function computeTrustScore(input: TrustScoreInput): number {
    const verificationScore = computeVerificationScore(input);
    const sessionScore = computeSessionScore(input.totalSessions);
    const ratingScore = computeRatingScore(input.avgRating, input.totalReviews);
    const safetyScore = computeSafetyScore(input.openReports, input.criticalReports);
    const reliabilityScore = computeReliabilityScore(input.cancellationRate, input.responseTimeMinutes);
    const ageScore = computeAgeScore(input.accountAgeDays);

    const weighted =
        (verificationScore * TRUST_WEIGHTS.verification +
            sessionScore * TRUST_WEIGHTS.sessionHistory +
            ratingScore * TRUST_WEIGHTS.rating +
            safetyScore * TRUST_WEIGHTS.safetyRecord +
            reliabilityScore * TRUST_WEIGHTS.reliability +
            ageScore * TRUST_WEIGHTS.accountAge) /
        100;

    return clamp(Math.round(weighted), 0, 100);
}

function computeVerificationScore(input: TrustScoreInput): number {
    let score = 0;
    if (input.identityVerified) score += 40;
    if (input.credentialsVerified) score += 35;
    if (input.backgroundCheck) score += 25;
    return score;
}

function computeSessionScore(totalSessions: number): number {
    // Logarithmic curve: quickly rises to 50, slowly to 100
    if (totalSessions === 0) return 0;
    return clamp(Math.round(Math.log10(totalSessions) * 40), 0, 100);
}

function computeRatingScore(avgRating: number, totalReviews: number): number {
    if (totalReviews === 0) return 0;
    // Rating out of 5 → normalized to 100, weighted by review count confidence
    const ratingNorm = (avgRating / 5) * 100;
    const confidence = Math.min(totalReviews / 50, 1); // full confidence at 50+ reviews
    return Math.round(ratingNorm * confidence);
}

function computeSafetyScore(openReports: number, criticalReports: number): number {
    // Start at 100, deduct for each open report
    const penalty = openReports * 15 + criticalReports * 25;
    return clamp(100 - penalty, 0, 100);
}

function computeReliabilityScore(cancellationRate: number, responseTimeMinutes: number): number {
    // Low cancellation = good, fast response = good
    const cancelScore = clamp(100 - cancellationRate * 200, 0, 100);
    const responseScore = responseTimeMinutes <= 5 ? 100 :
        responseTimeMinutes <= 15 ? 80 :
            responseTimeMinutes <= 30 ? 50 : 20;
    return Math.round((cancelScore + responseScore) / 2);
}

function computeAgeScore(accountAgeDays: number): number {
    // Gradual increase: full score at 365 days
    return clamp(Math.round((accountAgeDays / 365) * 100), 0, 100);
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// ─── Trust Tier Mapping ─────────────────────────────────────────────────────

/**
 * Map a trust score to a trust tier.
 */
export function computeTrustTier(score: number): TrustTier {
    if (score >= TRUST_TIER_THRESHOLDS.trusted) return 'trusted';
    if (score >= TRUST_TIER_THRESHOLDS.established) return 'established';
    if (score >= TRUST_TIER_THRESHOLDS.verified) return 'verified';
    return 'new';
}

// ─── Auto-Suspend Logic ─────────────────────────────────────────────────────

/**
 * Returns true if the user should be auto-suspended based on critical open reports.
 */
export function shouldAutoSuspend(
    reports: Array<{ severity: ReportSeverity; status: ReportStatus }>,
): boolean {
    const criticalOpen = reports.filter(
        (r) => r.severity === 'critical' && r.status === 'open',
    );
    return criticalOpen.length >= AUTO_SUSPEND_THRESHOLD;
}

// ─── Cancellation Penalty ───────────────────────────────────────────────────

/**
 * Determine penalty based on cancellation history.
 * Only late cancellations (outside grace period) count.
 */
export function getCancellationPenalty(records: CancellationRecord[]): CancellationPenalty {
    const lateCancellations = records.filter((r) => !r.withinGracePeriod);
    const count = lateCancellations.length;

    if (count === 0) return 'none';
    if (count <= 2) return 'warning';
    if (count <= 4) return 'cooldown';
    return 'suspension';
}

// ─── Booking Eligibility ────────────────────────────────────────────────────

interface SeekerProfile {
    trustTier: TrustTier;
    isSuspended: boolean;
}

interface HealerProfile {
    trustTier: TrustTier;
    isSuspended: boolean;
    hasActiveSession: boolean;
}

interface BookingResult {
    allowed: boolean;
    reason?: string;
}

/**
 * Check if a seeker can book a session with a healer.
 */
export function canBookSession(seeker: SeekerProfile, healer: HealerProfile): BookingResult {
    if (seeker.isSuspended) {
        return { allowed: false, reason: 'Your account is suspended pending review.' };
    }

    if (healer.isSuspended) {
        return { allowed: false, reason: 'This healer is suspended pending review.' };
    }

    if (healer.hasActiveSession) {
        return { allowed: false, reason: 'This healer is currently in a session. Please try again later.' };
    }

    return { allowed: true };
}
