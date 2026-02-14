// HoldSpace — Trust, Safety & Session Types
//
// Core type system for marketplace trust scoring, safety reporting,
// and session state management. Domain-agnostic where possible.

// ─── Trust Tiers ────────────────────────────────────────────────────────────

export type TrustTier = 'new' | 'verified' | 'established' | 'trusted';

export const TRUST_TIER_THRESHOLDS = {
    new: 0,
    verified: 30,
    established: 60,
    trusted: 85,
} as const;

export const TRUST_TIER_LABELS: Record<TrustTier, { label: string; icon: string; color: string }> = {
    new: { label: 'New', icon: '🆕', color: '#94a3b8' },
    verified: { label: 'Verified', icon: '✅', color: '#22c55e' },
    established: { label: 'Established', icon: '🌿', color: '#10b981' },
    trusted: { label: 'Trusted', icon: '💎', color: '#8b5cf6' },
};

// ─── Verification ───────────────────────────────────────────────────────────

export interface VerificationStatus {
    identityVerified: boolean;
    credentialsVerified: boolean;
    backgroundCheck: boolean;
    tier: TrustTier;
    trustScore: number; // 0–100
}

// ─── Safety Reporting ───────────────────────────────────────────────────────

export type ReportCategory =
    | 'inappropriate'
    | 'harassment'
    | 'no_show'
    | 'misrepresentation'
    | 'safety_concern';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'escalated';

export interface SafetyReport {
    id: string;
    reporterId: string;
    reportedId: string;
    reporterRole: 'healer' | 'seeker';
    category: ReportCategory;
    description: string;
    sessionId?: string;
    severity: ReportSeverity;
    status: ReportStatus;
    createdAt: string;
}

// ─── SOS Event ──────────────────────────────────────────────────────────────

export interface SOSEvent {
    sessionId: string;
    triggeredBy: 'healer' | 'seeker';
    timestamp: string;
    locationSnapshot?: { lat: number; lng: number };
}

// ─── Session ────────────────────────────────────────────────────────────────

export type SessionStatus =
    | 'pending'
    | 'confirmed'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'reported';

export interface Session {
    id: string;
    healerId: string;
    seekerId: string;
    status: SessionStatus;
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
    durationMinutes: number;
    cancelledBy?: 'healer' | 'seeker' | 'system';
    cancellationReason?: string;
    sosEvent?: SOSEvent;
}

// ─── Cancellation History ───────────────────────────────────────────────────

export type CancellationPenalty = 'none' | 'warning' | 'cooldown' | 'suspension';

export interface CancellationRecord {
    sessionId: string;
    cancelledBy: 'healer' | 'seeker';
    cancelledAt: string;
    reason?: string;
    withinGracePeriod: boolean; // cancelled > 24h before = no penalty
}

// ─── Trust Engine Input ─────────────────────────────────────────────────────

export interface TrustScoreInput {
    identityVerified: boolean;
    credentialsVerified: boolean;
    backgroundCheck: boolean;
    totalSessions: number;
    avgRating: number;
    totalReviews: number;
    openReports: number;
    criticalReports: number;
    cancellationRate: number; // 0–1
    accountAgeDays: number;
    responseTimeMinutes: number;
}

// ─── Trust Engine Weights ───────────────────────────────────────────────────

export const TRUST_WEIGHTS = {
    verification: 25,       // ID + credentials + background
    sessionHistory: 20,     // total sessions completed
    rating: 20,             // avg rating weighted by review count
    safetyRecord: 20,       // inverse of reports
    reliability: 10,        // cancellation rate + response time
    accountAge: 5,          // longevity bonus
} as const;

export const AUTO_SUSPEND_THRESHOLD = 3;       // critical reports
export const CONFIRMATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const GRACE_PERIOD_HOURS = 24;          // cancellation grace period
