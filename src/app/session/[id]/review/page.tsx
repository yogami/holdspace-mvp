"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SEED_HEALERS } from "@/lib/seed-data";

export default function ReviewPage() {
    const params = useParams();
    const healerId = params.id as string;
    const healer = SEED_HEALERS.find(h => h.id === healerId);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
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
        if (rating > 0) {
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
                            <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>💛</div>
                            <h2>Thank you for sharing</h2>
                            <p style={{ margin: "var(--space-md) auto" }}>
                                Your review helps other seekers find the right healer for them.
                                We hope this session brought you a moment of peace.
                            </p>
                            <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", marginTop: "var(--space-xl)" }}>
                                <Link href="/healers" className="btn btn--primary">
                                    Browse more healers
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
                    <div className="review-form-container animate-in">
                        <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>🌿</div>
                        <h2>How was your session?</h2>
                        <p style={{ margin: "var(--space-md) auto" }}>
                            Your honest reflection helps others find the right support.
                            Only your first name will be shown.
                        </p>

                        <div style={{ margin: "var(--space-xl) 0" }}>
                            <img
                                src={healer.avatarUrl}
                                alt={healer.fullName}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    margin: "0 auto var(--space-sm)",
                                }}
                            />
                            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.1rem", color: "var(--charcoal)" }}>
                                {healer.fullName}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="star-select">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={i <= (hoverRating || rating) ? "active" : ""}
                                        onClick={() => setRating(i)}
                                        onMouseEnter={() => setHoverRating(i)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            {rating > 0 && (
                                <p className="text-sm text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                                    {rating === 5 && "Transformative ✨"}
                                    {rating === 4 && "Really helpful 🌱"}
                                    {rating === 3 && "Good experience 🌿"}
                                    {rating === 2 && "Could be better 🤔"}
                                    {rating === 1 && "Not what I needed 😔"}
                                </p>
                            )}

                            <textarea
                                placeholder="Share what the experience was like for you... (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                            />

                            <button
                                type="submit"
                                className="btn btn--primary"
                                style={{ width: "100%", marginTop: "var(--space-md)" }}
                                disabled={rating === 0}
                            >
                                Submit reflection
                            </button>

                            <button
                                type="button"
                                className="btn btn--secondary"
                                style={{ width: "100%", marginTop: "var(--space-sm)" }}
                                onClick={() => setSubmitted(true)}
                            >
                                Skip for now
                            </button>

                            <Link
                                href={`/session/${healerId}/safety-report`}
                                className="safety-link"
                                style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-md)" }}
                            >
                                🛡️ Report a safety concern
                            </Link>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
