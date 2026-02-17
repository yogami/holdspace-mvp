// HoldSpace — Server-Side Data Access Layer
// All database queries live here. Used by server components and API routes.
import "server-only";

import { db } from "./db";
import { healers, reviews, users } from "./schema";
import { eq } from "drizzle-orm";
import type { Healer, Review } from "./constants";

// ─── Healer Queries ──────────────────────────────────────────────────

function mapDbHealerToFrontend(h: typeof healers.$inferSelect): Healer {
    return {
        id: h.slug,
        fullName: h.fullName,
        avatarUrl: h.avatarUrl ?? "",
        bio: h.bio ?? "",
        modalities: (h.modalities ?? []) as Healer["modalities"],
        certifications: (h.certifications ?? []) as string[],
        languages: (h.languages ?? []) as string[],
        hourlyRate: h.hourlyRate ?? 0,
        currency: h.currency ?? "USD",
        availabilityStatus: (h.availabilityStatus ?? "offline") as Healer["availabilityStatus"],
        isVerified: h.isVerified ?? false,
        yearsExperience: h.yearsExperience ?? 0,
        avgRating: h.avgRating ?? 0,
        totalReviews: h.totalReviews ?? 0,
        totalSessions: h.totalSessions ?? 0,
        trustScore: h.trustScore ?? 0,
        trustTier: (h.trustTier ?? "new") as Healer["trustTier"],
        identityVerified: h.identityVerified ?? false,
        credentialsVerified: h.credentialsVerified ?? false,
        backgroundCheck: h.backgroundCheck ?? false,
        cancellationRate: h.cancellationRate ?? 0,
        responseTimeMinutes: h.responseTimeMinutes ?? 0,
        accountCreatedAt: h.createdAt.toISOString(),
        activeSessionId: null,
        lastLocationUpdate: null,
        practitionerType: (h.practitionerType ?? "unclassified") as Healer["practitionerType"],
        meetingUrl: h.meetingUrl ?? null,
    };
}

/** Get all healers, mapped to frontend shape */
export async function getHealers(): Promise<Healer[]> {
    const rows = await db.select().from(healers);
    return rows.map(mapDbHealerToFrontend);
}

/** Get a single healer by slug */
export async function getHealerBySlug(slug: string): Promise<Healer | null> {
    const [row] = await db
        .select()
        .from(healers)
        .where(eq(healers.slug, slug))
        .limit(1);
    return row ? mapDbHealerToFrontend(row) : null;
}

/** Get reviews for a healer (by slug) */
export async function getReviewsBySlug(slug: string): Promise<Review[]> {
    const [healer] = await db
        .select()
        .from(healers)
        .where(eq(healers.slug, slug))
        .limit(1);

    if (!healer) return [];

    const rows = await db
        .select()
        .from(reviews)
        .where(eq(reviews.healerId, healer.id));

    return rows.map(r => ({
        id: r.id,
        seekerName: r.seekerName ?? "Anonymous",
        rating: r.rating,
        comment: r.comment ?? "",
        createdAt: r.createdAt.toISOString(),
    }));
}

/** Count healers currently online */
export async function getOnlineCount(): Promise<number> {
    const rows = await db
        .select()
        .from(healers)
        .where(eq(healers.availabilityStatus, "online"));
    return rows.length;
}

/** Get featured healers (online first, limited) */
export async function getFeaturedHealers(limit: number): Promise<Healer[]> {
    const rows = await db.select().from(healers);
    const mapped = rows.map(mapDbHealerToFrontend);

    // Sort: online first, then by rating
    mapped.sort((a, b) => {
        const statusOrder = { online: 0, available_soon: 1, offline: 2 };
        const sd = statusOrder[a.availabilityStatus] - statusOrder[b.availabilityStatus];
        if (sd !== 0) return sd;
        return b.avgRating - a.avgRating;
    });

    return mapped.slice(0, limit);
}

/** Get healer profile for an authenticated user (by user ID) */
export async function getHealerByUserId(userId: string): Promise<Healer | null> {
    const [row] = await db
        .select()
        .from(healers)
        .where(eq(healers.userId, userId))
        .limit(1);
    return row ? mapDbHealerToFrontend(row) : null;
}
