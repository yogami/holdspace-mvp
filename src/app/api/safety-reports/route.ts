// POST /api/safety-reports — Submit a safety report about a healer
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safetyReports, healers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { healerSlug, category, description } = body;

        if (!healerSlug || !category) {
            return NextResponse.json(
                { error: "healerSlug and category are required." },
                { status: 400 }
            );
        }

        const validCategories = [
            "inappropriate", "harassment", "no_show",
            "misrepresentation", "safety_concern",
        ];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { error: "Invalid category." },
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

        await db.insert(safetyReports).values({
            healerId: healer.id,
            category: category as "inappropriate" | "harassment" | "no_show" | "misrepresentation" | "safety_concern",
            description: description || "",
        });

        return NextResponse.json(
            { message: "Safety report submitted. Our team will review it within 24 hours." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Safety report error:", error);
        return NextResponse.json(
            { error: "Failed to submit report." },
            { status: 500 }
        );
    }
}
