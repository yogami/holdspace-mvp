// Healers Marketplace — Server Component shell
// Fetches healers from Neon, passes to client filter grid
import Link from "next/link";
import { getHealers } from "@/lib/data";
import HealerGrid from "@/components/healer-grid";
export const dynamic = "force-dynamic";

export default async function HealersPage() {
    const healers = await getHealers();

    return (
        <>
            <nav className="nav">
                <Link href="/" className="nav__logo">
                    <span className="nav__logo-icon">🌿</span>
                    HoldSpace
                </Link>
                <ul className="nav__links">
                    <li><Link href="/healers">Find a Healer</Link></li>
                    <li><Link href="/#waitlist" className="btn btn--primary btn--sm">Join Waitlist</Link></li>
                </ul>
            </nav>

            <main className="section" style={{ paddingTop: "var(--space-xl)" }}>
                <div className="container">
                    <div className="animate-in" style={{ marginBottom: "var(--space-xl)" }}>
                        <h1 style={{ marginBottom: "var(--space-sm)" }}>Find your healer</h1>
                        <p>Browse available facilitators and book a session when you&apos;re ready.</p>
                    </div>

                    <HealerGrid initialHealers={healers} />
                </div>
            </main>
        </>
    );
}
