// Healer Profile — Server Component
// Fetches healer + reviews from Neon, passes to interactive client component
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHealerBySlug, getReviewsBySlug } from "@/lib/data";
import HealerProfileClient from "@/components/healer-profile-client";
export const dynamic = "force-dynamic";

export default async function HealerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [healer, reviews] = await Promise.all([
        getHealerBySlug(id),
        getReviewsBySlug(id),
    ]);

    if (!healer) {
        return (
            <div className="container section" style={{ textAlign: "center" }}>
                <h2>Healer not found</h2>
                <p>This healer doesn&apos;t exist or has been removed.</p>
                <Link href="/healers" className="btn btn--primary" style={{ marginTop: "var(--space-lg)" }}>
                    Browse healers
                </Link>
            </div>
        );
    }

    return <HealerProfileClient healer={healer} reviews={reviews} />;
}
