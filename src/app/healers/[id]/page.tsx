"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MODALITIES, DURATION_OPTIONS, AVAILABILITY_LABELS } from "@/lib/constants";
import { SEED_HEALERS, SEED_REVIEWS } from "@/lib/seed-data";

function StarDisplay({ rating, size }: { rating: number; size?: "lg" }) {
    return (
        <span className={`stars ${size === "lg" ? "stars--lg" : ""}`}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>★</span>
            ))}
        </span>
    );
}

export default function HealerProfilePage() {
    const params = useParams();
    const healerId = params.id as string;
    const healer = SEED_HEALERS.find(h => h.id === healerId);
    const reviews = SEED_REVIEWS[healerId] || [];

    const [showBooking, setShowBooking] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(60);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);

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

    const selectedDurationOption = DURATION_OPTIONS.find(d => d.minutes === selectedDuration)!;
    const totalPrice = healer.hourlyRate * (selectedDuration / 60);

    const handleBooking = () => {
        setBookingConfirmed(true);
    };

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
                    {/* Breadcrumb */}
                    <div className="text-sm text-muted animate-in" style={{ marginBottom: "var(--space-xl)" }}>
                        <Link href="/healers" style={{ color: "inherit" }}>Healers</Link>
                        <span style={{ margin: "0 var(--space-sm)" }}>→</span>
                        <span>{healer.fullName}</span>
                    </div>

                    {/* Profile Hero */}
                    <div className="profile-hero animate-in">
                        <img
                            className="profile-avatar"
                            src={healer.avatarUrl}
                            alt={healer.fullName}
                        />
                        <div className="profile-info">
                            <div>
                                <div className={`availability availability--${healer.availabilityStatus}`} style={{ marginBottom: "var(--space-sm)" }}>
                                    <span className="availability__dot"></span>
                                    <span>{AVAILABILITY_LABELS[healer.availabilityStatus]}</span>
                                </div>
                                <h1>{healer.fullName} {healer.isVerified && <span title="Verified healer" style={{ fontSize: "0.6em" }}>✓</span>}</h1>
                            </div>

                            <div className="profile-meta">
                                <div className="rating-summary">
                                    <StarDisplay rating={healer.avgRating} />
                                    <span className="rating-number">{healer.avgRating}</span>
                                    <span className="text-sm text-muted">({healer.totalReviews} reviews)</span>
                                </div>
                                <span className="text-sm text-muted">·</span>
                                <span className="text-sm text-muted">{healer.totalSessions} sessions held</span>
                                <span className="text-sm text-muted">·</span>
                                <span className="text-sm text-muted">{healer.yearsExperience} years experience</span>
                            </div>

                            <p style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>{healer.bio}</p>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
                                {healer.modalities.map(m => {
                                    const mod = MODALITIES.find(mod => mod.id === m);
                                    return (
                                        <span key={m} className="badge badge--sage">{mod?.icon} {mod?.label}</span>
                                    );
                                })}
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
                                {healer.languages.map(lang => (
                                    <span key={lang} className="badge badge--clay">{lang}</span>
                                ))}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)", marginTop: "var(--space-md)" }}>
                                <div>
                                    <div className="healer-card__price" style={{ fontSize: "1.6rem" }}>
                                        ${healer.hourlyRate}<span style={{ fontSize: "0.9rem" }}>/hr</span>
                                    </div>
                                </div>
                                {healer.availabilityStatus !== "offline" ? (
                                    <button className="btn btn--primary btn--lg" onClick={() => setShowBooking(true)}>
                                        Book a session
                                    </button>
                                ) : (
                                    <button className="btn btn--secondary btn--lg" disabled style={{ opacity: 0.5 }}>
                                        Currently offline
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certifications */}
                    {healer.certifications.length > 0 && (
                        <div className="profile-section animate-in">
                            <h3>Certifications &amp; Training</h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
                                {healer.certifications.map(cert => (
                                    <span key={cert} className="badge badge--gold">🏅 {cert}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="profile-section animate-in">
                        <h3>What people are saying ({reviews.length})</h3>
                        {reviews.length > 0 ? (
                            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                                {reviews.map(review => (
                                    <div key={review.id} className="review-card">
                                        <div className="review-header">
                                            <span className="review-author">{review.seekerName}</span>
                                            <StarDisplay rating={review.rating} />
                                            <span className="review-date">{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                        </div>
                                        <p className="review-text">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted">No reviews yet. Be the first to share your experience.</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            {showBooking && (
                <div className="booking-overlay" onClick={() => !bookingConfirmed && setShowBooking(false)}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()}>
                        {!bookingConfirmed ? (
                            <>
                                <h2>Book a session with {healer.fullName}</h2>
                                <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                                    Choose how long you&apos;d like your session to be.
                                </p>

                                <div className="booking-duration-options">
                                    {DURATION_OPTIONS.map(option => (
                                        <div
                                            key={option.minutes}
                                            className={`duration-option ${selectedDuration === option.minutes ? "duration-option--selected" : ""}`}
                                            onClick={() => setSelectedDuration(option.minutes)}
                                        >
                                            <span className="duration-option__label">{option.label}</span>
                                            <span className="duration-option__price">
                                                ${(healer.hourlyRate * option.minutes / 60).toFixed(0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "var(--space-md) var(--space-lg)",
                                    background: "var(--warm-white)", borderRadius: "var(--radius-md)",
                                    marginBottom: "var(--space-lg)"
                                }}>
                                    <span>Total</span>
                                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 600, color: "var(--terracotta)" }}>
                                        ${totalPrice.toFixed(0)}
                                    </span>
                                </div>

                                <button className="btn btn--primary" style={{ width: "100%" }} onClick={handleBooking}>
                                    Continue to payment →
                                </button>

                                <p className="text-xs text-muted" style={{ textAlign: "center", marginTop: "var(--space-md)" }}>
                                    You&apos;ll be redirected to our secure payment partner. No charge until your session begins.
                                </p>
                            </>
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>🌿</div>
                                <h2>You&apos;re booked!</h2>
                                <p style={{ margin: "var(--space-md) auto" }}>
                                    Your {selectedDurationOption.label} session with {healer.fullName} is confirmed.
                                </p>

                                <div className="card card--warm" style={{ textAlign: "left", margin: "var(--space-lg) 0" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-sm)" }}>
                                        <span className="text-sm text-muted">Duration</span>
                                        <span className="text-sm" style={{ fontWeight: 600 }}>{selectedDurationOption.label}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-sm)" }}>
                                        <span className="text-sm text-muted">Amount</span>
                                        <span className="text-sm" style={{ fontWeight: 600 }}>${totalPrice.toFixed(0)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span className="text-sm text-muted">Status</span>
                                        <span className="badge badge--sage">Ready to connect</span>
                                    </div>
                                </div>

                                <Link href={`/session/${healer.id}`} className="btn btn--primary" style={{ width: "100%" }}>
                                    Join video session →
                                </Link>

                                <button
                                    className="btn btn--secondary"
                                    style={{ width: "100%", marginTop: "var(--space-sm)" }}
                                    onClick={() => { setShowBooking(false); setBookingConfirmed(false); }}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
