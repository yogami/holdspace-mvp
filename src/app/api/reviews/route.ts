// POST /api/reviews — Submit a review for a healer
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, healers } from "@/lib/schema";
import { eq, avg, count } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { healerSlug, rating, comment, seekerName } = body;

        if (!healerSlug || !rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "healerSlug and rating (1-5) are required." },
                { status: 400 }
            );
        }

        // Find healer by slug
        const [healer] = await db
            .select()
            .from(healers)
            .where(eq(healers.slug, healerSlug))
            .limit(1);

        if (!healer) {
            return NextResponse.json(
                { error: "Healer not found." },
                { status: 404 }
            );
        }

        // Insert the review
        await db.insert(reviews).values({
            healerId: healer.id,
            seekerName: seekerName || "Anonymous",
            rating,
            comment: comment || "",
        });

        // Recalculate healer's average rating and total reviews
        const [stats] = await db
            .select({
                avgRating: avg(reviews.rating),
                totalReviews: count(reviews.id),
            })
            .from(reviews)
            .where(eq(reviews.healerId, healer.id));

        await db
            .update(healers)
            .set({
                avgRating: parseFloat(String(stats.avgRating ?? 0)),
                totalReviews: Number(stats.totalReviews),
                updatedAt: new Date(),
            })
            .where(eq(healers.id, healer.id));

        return NextResponse.json({ message: "Review submitted." }, { status: 201 });
    } catch (error) {
        console.error("Review submission error:", error);
        return NextResponse.json(
            { error: "Failed to submit review." },
            { status: 500 }
        );
    }
}
