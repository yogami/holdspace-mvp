// GET /api/healers — List healers from database
// Supports: ?modality=breathwork&lang=English&maxPrice=100&online=true&q=search
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { healers } from "@/lib/schema";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const modality = url.searchParams.get("modality");
        const lang = url.searchParams.get("lang");
        const maxPrice = url.searchParams.get("maxPrice");
        const onlineOnly = url.searchParams.get("online");
        const search = url.searchParams.get("q");

        let rows = await db.select().from(healers);

        // Apply filters in memory (simple approach for MVP)
        if (modality) {
            rows = rows.filter(h =>
                (h.modalities as string[])?.includes(modality)
            );
        }

        if (lang) {
            rows = rows.filter(h =>
                (h.languages as string[])?.includes(lang)
            );
        }

        if (maxPrice) {
            const max = parseInt(maxPrice, 10);
            rows = rows.filter(h => (h.hourlyRate ?? 0) <= max);
        }

        if (onlineOnly === "true") {
            rows = rows.filter(h => h.availabilityStatus === "online");
        }

        if (search) {
            const q = search.toLowerCase();
            rows = rows.filter(h =>
                h.slug.toLowerCase().includes(q) ||
                h.fullName.toLowerCase().includes(q) ||
                (h.bio ?? "").toLowerCase().includes(q)
            );
        }

        // Map to frontend Healer shape
        const result = rows.map(h => ({
            id: h.slug,
            fullName: h.fullName,
            avatarUrl: h.avatarUrl ?? "",
            bio: h.bio ?? "",
            modalities: h.modalities ?? [],
            certifications: h.certifications ?? [],
            languages: h.languages ?? [],
            hourlyRate: h.hourlyRate ?? 0,
            currency: h.currency ?? "USD",
            availabilityStatus: h.availabilityStatus ?? "offline",
            isVerified: h.isVerified ?? false,
            yearsExperience: h.yearsExperience ?? 0,
            avgRating: h.avgRating ?? 0,
            totalReviews: h.totalReviews ?? 0,
            totalSessions: h.totalSessions ?? 0,
            trustScore: h.trustScore ?? 0,
            trustTier: h.trustTier ?? "new",
            identityVerified: h.identityVerified ?? false,
            credentialsVerified: h.credentialsVerified ?? false,
            backgroundCheck: h.backgroundCheck ?? false,
            cancellationRate: h.cancellationRate ?? 0,
            responseTimeMinutes: h.responseTimeMinutes ?? 0,
            accountCreatedAt: h.createdAt.toISOString(),
            activeSessionId: null,
            lastLocationUpdate: null,
            practitionerType: h.practitionerType ?? "unclassified",
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Healers API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch healers." },
            { status: 500 }
        );
    }
}
