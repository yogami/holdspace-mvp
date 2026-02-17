// GET/POST /api/sessions — Healer's sessions
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessions, healers } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// GET — returns sessions for the authenticated healer
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
            return NextResponse.json({ error: "Healer not found" }, { status: 404 });
        }

        const rows = await db
            .select()
            .from(sessions)
            .where(eq(sessions.healerId, healer.id))
            .orderBy(desc(sessions.scheduledDate));

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Sessions fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch sessions." }, { status: 500 });
    }
}

// POST — create a new session/booking
export async function POST(req: Request) {
    try {
        const authSession = await auth();
        const body = await req.json();
        const { healerId, healerSlug, seekerName, modality, duration, scheduledDate, scheduledTime } = body;

        // Accept either healerId or healerSlug (healerId on frontend is actually the slug)
        const slug = healerId || healerSlug;
        if (!slug) {
            return NextResponse.json({ error: "healerId or healerSlug is required." }, { status: 400 });
        }

        const [healer] = await db
            .select()
            .from(healers)
            .where(eq(healers.slug, slug))
            .limit(1);

        if (!healer) {
            return NextResponse.json({ error: "Healer not found." }, { status: 404 });
        }

        // Use authenticated user name, or provided name, or "Anonymous Seeker"
        const resolvedSeekerName = seekerName || (authSession?.user as { name?: string })?.name || "Anonymous Seeker";

        const [newSession] = await db
            .insert(sessions)
            .values({
                healerId: healer.id,
                seekerName: resolvedSeekerName,
                modality: modality || null,
                duration: duration || 60,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
                scheduledTime: scheduledTime || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                status: "confirmed",
            })
            .returning();

        return NextResponse.json(newSession, { status: 201 });
    } catch (error) {
        console.error("Session creation error:", error);
        return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
    }
}
