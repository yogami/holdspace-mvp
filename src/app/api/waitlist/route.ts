// POST /api/waitlist — Store waitlist email in database
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/schema";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required." },
                { status: 400 }
            );
        }

        await db
            .insert(waitlist)
            .values({ email: email.toLowerCase().trim() })
            .onConflictDoNothing();

        return NextResponse.json({ message: "Added to waitlist!" });
    } catch (error) {
        console.error("Waitlist error:", error);
        return NextResponse.json(
            { error: "Failed to join waitlist." },
            { status: 500 }
        );
    }
}
