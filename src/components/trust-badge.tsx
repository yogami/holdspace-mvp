"use client";

import { TRUST_TIER_LABELS, type TrustTier } from '@/lib/trust-types';

interface TrustBadgeProps {
    tier: TrustTier;
    score: number;
    identityVerified: boolean;
    credentialsVerified: boolean;
    backgroundCheck: boolean;
    compact?: boolean;
}

export function TrustBadge({
    tier,
    score,
    identityVerified,
    credentialsVerified,
    backgroundCheck,
    compact = false,
}: TrustBadgeProps) {
    const tierInfo = TRUST_TIER_LABELS[tier];

    if (compact) {
        return (
            <span
                className="trust-badge trust-badge--compact"
                style={{ '--badge-color': tierInfo.color } as React.CSSProperties}
                title={`${tierInfo.label} • Trust Score: ${score}/100`}
            >
                {tierInfo.icon} {tierInfo.label}
            </span>
        );
    }

    return (
        <div
            className="trust-badge trust-badge--full"
            style={{ '--badge-color': tierInfo.color } as React.CSSProperties}
        >
            <div className="trust-badge__header">
                <span className="trust-badge__icon">{tierInfo.icon}</span>
                <span className="trust-badge__tier">{tierInfo.label}</span>
                <span className="trust-badge__score">{score}/100</span>
            </div>

            <div className="trust-badge__checks">
                <Check passed={identityVerified} label="Identity verified" />
                <Check passed={credentialsVerified} label="Credentials verified" />
                <Check passed={backgroundCheck} label="Background check" />
            </div>
        </div>
    );
}

function Check({ passed, label }: { passed: boolean; label: string }) {
    return (
        <div className={`trust-check ${passed ? 'trust-check--passed' : 'trust-check--pending'}`}>
            <span className="trust-check__icon">{passed ? '✓' : '○'}</span>
            <span className="trust-check__label">{label}</span>
        </div>
    );
}
