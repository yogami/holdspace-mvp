// PATCH /api/healers/availability — Toggle healer online/offline
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { healers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { status } = await req.json();
        if (!["online", "offline"].includes(status)) {
            return NextResponse.json(
                { error: "Status must be 'online' or 'offline'." },
                { status: 400 }
            );
        }

        await db
            .update(healers)
            .set({
                availabilityStatus: status,
                updatedAt: new Date(),
            })
            .where(eq(healers.userId, session.user.id));

        return NextResponse.json({ status });
    } catch (error) {
        console.error("Availability error:", error);
        return NextResponse.json(
            { error: "Failed to update availability." },
            { status: 500 }
        );
    }
}
