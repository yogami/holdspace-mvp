// HoldSpace — Database Seed Script
// Inserts the 8 seed healers into Neon
// Run: DATABASE_URL='...' npx tsx src/lib/seed.ts

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users, healers, reviews } from "./schema";
import { SEED_HEALERS, SEED_REVIEWS } from "./seed-data";
import bcrypt from "bcryptjs";

async function seed() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log("🌱 Seeding HoldSpace database...\n");

    for (const healer of SEED_HEALERS) {
        const email = `${healer.id}@holdspace.app`;
        const passwordHash = await bcrypt.hash("seed-password-123", 10);

        const [user] = await db
            .insert(users)
            .values({
                email,
                passwordHash,
                name: healer.fullName,
                role: "healer",
            })
            .onConflictDoNothing()
            .returning();

        if (!user) {
            console.log(`  ⏭️  ${healer.fullName} (already exists)`);
            continue;
        }

        await db.insert(healers).values({
            userId: user.id,
            slug: healer.id,
            fullName: healer.fullName,
            avatarUrl: healer.avatarUrl,
            bio: healer.bio,
            modalities: healer.modalities as string[],
            certifications: healer.certifications,
            languages: healer.languages,
            hourlyRate: healer.hourlyRate,
            currency: healer.currency,
            availabilityStatus: healer.availabilityStatus === "available_soon" ? "available_soon" : healer.availabilityStatus,
            isVerified: healer.isVerified,
            yearsExperience: healer.yearsExperience,
            avgRating: healer.avgRating,
            totalReviews: healer.totalReviews,
            totalSessions: healer.totalSessions,
            trustScore: healer.trustScore,
            trustTier: healer.trustTier,
            identityVerified: healer.identityVerified,
            credentialsVerified: healer.credentialsVerified,
            backgroundCheck: healer.backgroundCheck,
            cancellationRate: healer.cancellationRate,
            responseTimeMinutes: healer.responseTimeMinutes,
            practitionerType: healer.practitionerType,
        });

        console.log(`  ✅ ${healer.fullName} (${email})`);
    }

    // Seed reviews
    console.log("\n📝 Seeding reviews...\n");
    const allHealers = await db.select().from(healers);

    for (const [healerSlug, healerReviews] of Object.entries(SEED_REVIEWS)) {
        const healer = allHealers.find(h => h.slug === healerSlug);
        if (!healer) {
            console.log(`  ⏭️  Reviews for ${healerSlug} (healer not found)`);
            continue;
        }

        for (const review of healerReviews) {
            await db.insert(reviews).values({
                healerId: healer.id,
                seekerName: review.seekerName,
                rating: review.rating,
                comment: review.comment,
            });
        }
        console.log(`  ✅ ${healerReviews.length} reviews for ${healerSlug}`);
    }

    console.log("\n🌿 Seed complete!");
}

seed().catch(console.error);
