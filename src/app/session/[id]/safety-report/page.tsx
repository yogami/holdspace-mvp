"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SEED_HEALERS } from "@/lib/seed-data";

const REPORT_CATEGORIES = [
    { id: "inappropriate", label: "Inappropriate behavior", icon: "⚠️" },
    { id: "harassment", label: "Harassment or threats", icon: "🚫" },
    { id: "no_show", label: "No-show", icon: "👻" },
    { id: "misrepresentation", label: "Misrepresentation of qualifications", icon: "🎭" },
    { id: "safety_concern", label: "I felt unsafe", icon: "🛡️" },
] as const;

export default function SafetyReportPage() {
    const params = useParams();
    const router = useRouter();
    const healerId = params.id as string;
    const healer = SEED_HEALERS.find(h => h.id === healerId);

    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);

    if (!healer) {
        return (
            <div className="container section" style={{ textAlign: "center" }}>
                <h2>Session not found</h2>
                <Link href="/healers" className="btn btn--primary" style={{ marginTop: "var(--space-lg)" }}>
                    Browse healers
                </Link>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category) {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <>
                <nav className="nav">
                    <Link href="/" className="nav__logo">
                        <span className="nav__logo-icon">🌿</span>
                        HoldSpace
                    </Link>
                </nav>
                <main className="section">
                    <div className="container">
                        <div className="review-form-container animate-in">
                            <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>🛡️</div>
                            <h2>Report received</h2>
                            <p style={{ margin: "var(--space-md) auto" }}>
                                Thank you for helping keep our community safe.
                                Our trust & safety team will review your report within 24 hours.
                                You will not be matched with this healer again unless you request it.
                            </p>
                            <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", marginTop: "var(--space-xl)" }}>
                                <Link href="/healers" className="btn btn--primary">
                                    Browse healers
                                </Link>
                                <Link href="/" className="btn btn--secondary">
                                    Go home
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <nav className="nav">
                <Link href="/" className="nav__logo">
                    <span className="nav__logo-icon">🌿</span>
                    HoldSpace
                </Link>
            </nav>

            <main className="section">
                <div className="container">
                    <div className="review-form-container animate-in" style={{ textAlign: "left" }}>
                        <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}>🛡️</div>
                            <h2>Report a safety concern</h2>
                            <p style={{ margin: "var(--space-md) auto", textAlign: "center" }}>
                                Your safety matters. All reports are confidential and reviewed by our trust & safety team.
                            </p>
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-md)",
                            padding: "var(--space-md)",
                            background: "var(--warm-white)",
                            borderRadius: "var(--radius-md)",
                            marginBottom: "var(--space-xl)",
                        }}>
                            <img
                                src={healer.avatarUrl}
                                alt={healer.fullName}
                                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                            />
                            <div>
                                <div style={{ fontWeight: 600 }}>Reporting about: {healer.fullName}</div>
                                <div className="text-sm text-muted">Session #{healerId}</div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "var(--space-xl)" }}>
                                <label style={{
                                    fontFamily: "var(--font-heading)",
                                    fontWeight: 500,
                                    fontSize: "0.95rem",
                                    display: "block",
                                    marginBottom: "var(--space-md)",
                                }}>
                                    What happened?
                                </label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                                    {REPORT_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`duration-option ${category === cat.id ? "duration-option--selected" : ""}`}
                                            onClick={() => setCategory(cat.id)}
                                        >
                                            <span className="duration-option__label">{cat.icon} {cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: "var(--space-xl)" }}>
                                <label style={{
                                    fontFamily: "var(--font-heading)",
                                    fontWeight: 500,
                                    fontSize: "0.95rem",
                                    display: "block",
                                    marginBottom: "var(--space-sm)",
                                }}>
                                    Additional details (optional)
                                </label>
                                <textarea
                                    placeholder="Describe what happened in your own words..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn--primary"
                                style={{ width: "100%" }}
                                disabled={!category}
                            >
                                Submit report
                            </button>

                            <Link
                                href={`/session/${healerId}/review`}
                                className="btn btn--secondary"
                                style={{ width: "100%", marginTop: "var(--space-sm)", textAlign: "center", display: "block" }}
                            >
                                Back to review
                            </Link>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
