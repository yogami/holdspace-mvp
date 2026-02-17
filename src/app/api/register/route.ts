// POST /api/register — Create a new account (healer or seeker)
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, healers } from "@/lib/schema";

export async function POST(req: Request) {
    try {
        const { email, password, fullName, role: requestedRole } = await req.json();

        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: "Email, password, and full name are required." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters." },
                { status: 400 }
            );
        }

        const role = requestedRole === "seeker" ? "seeker" : "healer";
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [user] = await db
            .insert(users)
            .values({
                email: email.toLowerCase().trim(),
                passwordHash,
                name: fullName,
                role,
            })
            .returning();

        // Create blank healer profile only for healers
        if (role === "healer") {
            const slug = fullName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            await db.insert(healers).values({
                userId: user.id,
                slug: `h-${slug}-${Date.now().toString(36)}`,
                fullName,
                availabilityStatus: "offline",
                practitionerType: "unclassified",
            });
        }

        return NextResponse.json(
            { message: "Account created", userId: user.id, role },
            { status: 201 }
        );
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        const code = (error as { code?: string })?.code;
        if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("23505") || code === "23505") {
            return NextResponse.json(
                { error: "An account with this email already exists." },
                { status: 409 }
            );
        }
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}
