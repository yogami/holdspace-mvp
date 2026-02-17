// PUT /api/healers/profile — Update healer profile
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { healers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Only allow updating specific fields
        const allowedFields: Record<string, unknown> = {};
        const editable = [
            "fullName", "bio", "modalities", "certifications",
            "languages", "hourlyRate", "currency", "yearsExperience",
            "practitionerType", "avatarUrl", "meetingUrl",
        ];

        for (const key of editable) {
            if (body[key] !== undefined) {
                // Map camelCase to schema field names
                const dbKey = key === "fullName" ? "fullName"
                    : key === "hourlyRate" ? "hourlyRate"
                        : key === "yearsExperience" ? "yearsExperience"
                            : key === "practitionerType" ? "practitionerType"
                                : key === "avatarUrl" ? "avatarUrl"
                                    : key;
                allowedFields[dbKey] = body[key];
            }
        }

        if (Object.keys(allowedFields).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update." },
                { status: 400 }
            );
        }

        await db
            .update(healers)
            .set({
                ...allowedFields,
                updatedAt: new Date(),
            } as Record<string, unknown>)
            .where(eq(healers.userId, session.user.id));

        return NextResponse.json({ message: "Profile updated." });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Failed to update profile." },
            { status: 500 }
        );
    }
}

// GET /api/healers/profile — Get current healer's profile
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [healer] = await db
            .select()
            .from(healers)
            .where(eq(healers.userId, session.user.id))
            .limit(1);

        if (!healer) {
            return NextResponse.json(
                { error: "Healer profile not found." },
                { status: 404 }
            );
        }

        return NextResponse.json(healer);
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile." },
            { status: 500 }
        );
    }
}
