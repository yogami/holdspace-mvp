"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MODALITIES, type Healer } from "@/lib/constants";
import { computeProgress, createProgram, enrollSeeker } from "@/lib/program-engine";
import type { Program, ProgramConfig } from "@/lib/program-types";
import "./dashboard.css";

const COMPLETENESS = 78;

// ─── Components ─────────────────────────────────────────────────────────

function DashboardNav() {
    return (
        <nav className="nav">
            <Link href="/" className="nav__logo">
                <span className="nav__logo-icon">🌿</span>
                HoldSpace
            </Link>
            <ul className="nav__links">
                <li><Link href="/healers">Marketplace</Link></li>
                <li><Link href="/onboarding">Edit Profile</Link></li>
            </ul>
        </nav>
    );
}

function OverviewCards({ healer }: { healer: Healer }) {
    const trustTierEmoji: Record<string, string> = {
        new: "🌱", verified: "✅", established: "⚡", trusted: "💎",
    };

    return (
        <div className="dashboard-cards">
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">📅</span>
                <div className="dashboard-stat-card__value">{healer.totalSessions}</div>
                <div className="dashboard-stat-card__label">Total Sessions</div>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">{trustTierEmoji[healer.trustTier]}</span>
                <div className="dashboard-stat-card__value">{healer.trustScore}</div>
                <div className="dashboard-stat-card__label">Trust Score</div>
                <div className="dashboard-stat-card__sub badge badge--sage">{healer.trustTier}</div>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">📊</span>
                <div className="dashboard-stat-card__value">{healer.totalSessions}</div>
                <div className="dashboard-stat-card__label">Total Sessions</div>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">⭐</span>
                <div className="dashboard-stat-card__value">{healer.avgRating}</div>
                <div className="dashboard-stat-card__label">Avg Rating ({healer.totalReviews} reviews)</div>
            </div>
        </div>
    );
}

function AvailabilityToggle({ initialStatus }: { initialStatus: "online" | "offline" }) {
    const [status, setStatus] = useState<"online" | "offline">(initialStatus);
    const [toggling, setToggling] = useState(false);

    const toggle = async () => {
        const newStatus = status === "online" ? "offline" : "online";
        setToggling(true);
        try {
            const res = await fetch("/api/healers/availability", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) setStatus(newStatus);
        } catch { } finally {
            setToggling(false);
        }
    };

    return (
        <div className="dashboard-availability">
            <div className={`availability availability--${status}`}>
                <span className="availability__dot" />
                <span>{status === "online" ? "You're online" : "You're offline"}</span>
            </div>
            <button
                type="button"
                className={`btn ${status === "online" ? "btn--sage btn--sm" : "btn--secondary btn--sm"}`}
                onClick={toggle}
                disabled={toggling}
            >
                {toggling ? "..." : status === "online" ? "Go Offline" : "Go Online"}
            </button>
        </div>
    );
}

interface SessionRow {
    id: string;
    modality: string | null;
    duration: number | null;
    scheduledDate: string | null;
    scheduledTime: string | null;
    status: string | null;
    rating: number | null;
    seekerName: string | null;
}

function SessionList() {
    const [sessions, setSessions] = useState<SessionRow[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        fetch("/api/sessions")
            .then(res => res.ok ? res.json() : [])
            .then(data => setSessions(data))
            .catch(() => [])
            .finally(() => setLoadingSessions(false));
    }, []);

    const statusStyle: Record<string, string> = {
        confirmed: "badge--sage",
        pending: "badge--gold",
        completed: "badge--sage",
        cancelled: "badge--terracotta",
    };

    const upcoming = sessions.filter(s => s.status === "confirmed" || s.status === "pending");
    const recent = sessions.filter(s => s.status === "completed" || s.status === "cancelled");

    if (loadingSessions) {
        return (
            <div className="dashboard-section">
                <h3>📅 Sessions</h3>
                <p className="text-muted">Loading sessions...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-section">
            <h3>📅 Upcoming Sessions</h3>
            {upcoming.length === 0 ? (
                <p className="text-muted" style={{ padding: "var(--space-md) 0" }}>No upcoming sessions yet. Share your profile to get booked!</p>
            ) : (
                <div className="dashboard-session-list">
                    {upcoming.map((s) => {
                        const mod = MODALITIES.find((m) => m.id === s.modality);
                        return (
                            <div key={s.id} className="dashboard-session-item">
                                <div className="dashboard-session-item__icon">{mod?.icon || "📅"}</div>
                                <div className="dashboard-session-item__details">
                                    <div className="dashboard-session-item__title">{mod?.label || s.modality} — {s.duration || 60}min</div>
                                    <div className="dashboard-session-item__meta text-sm text-muted">
                                        {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : "TBD"}
                                        {s.scheduledTime ? ` at ${s.scheduledTime}` : ""}
                                    </div>
                                </div>
                                <span className={`badge ${statusStyle[s.status || "pending"]}`}>{s.status}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            <h3 style={{ marginTop: "var(--space-xl)" }}>📋 Recent Sessions</h3>
            {recent.length === 0 ? (
                <p className="text-muted" style={{ padding: "var(--space-md) 0" }}>No completed sessions yet.</p>
            ) : (
                <div className="dashboard-session-list">
                    {recent.map((s) => {
                        const mod = MODALITIES.find((m) => m.id === s.modality);
                        return (
                            <div key={s.id} className="dashboard-session-item">
                                <div className="dashboard-session-item__icon">{mod?.icon || "📅"}</div>
                                <div className="dashboard-session-item__details">
                                    <div className="dashboard-session-item__title">{mod?.label || s.modality} — {s.duration || 60}min</div>
                                    <div className="dashboard-session-item__meta text-sm text-muted">
                                        {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : ""}
                                        {s.rating ? ` ★ ${s.rating}` : ""}
                                    </div>
                                </div>
                                <span className={`badge ${statusStyle[s.status || "completed"]}`}>{s.status}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ProgramsSection({ programs }: { programs: Program[] }) {
    const [showBuilder, setShowBuilder] = useState(false);

    return (
        <div className="dashboard-section">
            <div className="dashboard-section__header">
                <h3>🌿 Your Programs</h3>
                <button type="button" className="btn btn--sage btn--sm" onClick={() => setShowBuilder(!showBuilder)}>
                    {showBuilder ? "Cancel" : "+ New Program"}
                </button>
            </div>

            {programs.map((prog) => (
                <div key={prog.id} className="program-card">
                    <div className="program-card__header">
                        <h4>{prog.title}</h4>
                        <span className="badge badge--clay">{prog.isPublished ? "Published" : "Draft"}</span>
                    </div>
                    <p className="text-sm text-muted">{prog.description}</p>
                    <div className="program-card__meta">
                        <span className="text-sm">{prog.sessionCount} sessions</span>
                        <span className="text-sm">·</span>
                        <span className="text-sm">{MODALITIES.find((m) => m.id === prog.modality)?.label}</span>
                    </div>
                    <div className="program-card__milestones">
                        {prog.milestones.map((m, i) => (
                            <div key={i} className="program-milestone">
                                <span className="program-milestone__num">{m.stepNumber}</span>
                                <span className="program-milestone__title">{m.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {showBuilder && (
                <div className="program-builder animate-in">
                    <h4>Create New Program</h4>
                    <p className="text-sm text-muted">Define milestones and intention prompts for your multi-session journey.</p>
                    <div className="input-group">
                        <label>Program Title</label>
                        <input type="text" placeholder="e.g. Breathwork Foundations" />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea rows={3} placeholder="What will seekers experience in this program?" />
                    </div>
                    <div className="input-group">
                        <label>Number of Sessions</label>
                        <input type="number" min={2} max={12} placeholder="3" />
                    </div>
                    <button type="button" className="btn btn--primary" onClick={() => setShowBuilder(false)}>
                        Create Program
                    </button>
                </div>
            )}
        </div>
    );
}

function ProfileCompletenessCard() {
    return (
        <div className="dashboard-section">
            <h3>👤 Profile</h3>
            <div className="profile-completeness">
                <div className="profile-completeness__bar">
                    <div className="profile-completeness__fill" style={{ width: `${COMPLETENESS}%` }} />
                </div>
                <span className="text-sm text-muted">{COMPLETENESS}% complete</span>
            </div>
            <Link href="/onboarding" className="btn btn--secondary btn--sm" style={{ marginTop: "var(--space-md)" }}>
                Complete Profile →
            </Link>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [healer, setHealer] = useState<Healer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/healers/profile")
            .then(res => {
                if (!res.ok) throw new Error("Not authenticated");
                return res.json();
            })
            .then(data => setHealer(data))
            .catch(() => setHealer(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-layout">
                <DashboardNav />
                <div className="dashboard-container" style={{ textAlign: "center", padding: "var(--space-3xl)" }}>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Fallback for unauthenticated or missing healer
    const dashboardHealer: Healer = healer || {
        id: "demo",
        fullName: "Demo Healer",
        avatarUrl: "",
        bio: "",
        modalities: [],
        certifications: [],
        languages: [],
        hourlyRate: 0,
        currency: "USD",
        availabilityStatus: "offline",
        isVerified: false,
        yearsExperience: 0,
        avgRating: 0,
        totalReviews: 0,
        totalSessions: 0,
        trustScore: 0,
        trustTier: "new",
        identityVerified: false,
        credentialsVerified: false,
        backgroundCheck: false,
        cancellationRate: 0,
        responseTimeMinutes: 0,
        accountCreatedAt: new Date().toISOString(),
        activeSessionId: null,
        lastLocationUpdate: null,
        practitionerType: "unclassified",
        meetingUrl: null,
    };

    const programs: Program[] = dashboardHealer.id !== "demo" ? [
        createProgram(dashboardHealer.id, {
            title: "Breathwork Foundations",
            description: "A 3-session journey into conscious breathing.",
            modality: "breathwork",
            sessionCount: 3,
            milestones: [
                { stepNumber: 1, title: "Grounding", description: "Baseline connection", intentionPrompt: "What does safety feel like?", integrationPrompt: "What did you notice?" },
                { stepNumber: 2, title: "Deepening", description: "Expand capacity", intentionPrompt: "What will you release?", integrationPrompt: "What surfaced?" },
                { stepNumber: 3, title: "Integration", description: "Daily life anchoring", intentionPrompt: "How will you carry this?", integrationPrompt: "What shifted?" },
            ],
        }),
    ] : [];

    return (
        <div className="dashboard-layout">
            <DashboardNav />
            <div className="dashboard-container">
                <div className="dashboard-welcome animate-in">
                    <div>
                        <h1>Welcome back, {dashboardHealer.fullName.split(" ")[0]} 🌿</h1>
                        <p className="text-muted">Here&apos;s your practice at a glance.</p>
                    </div>
                    <AvailabilityToggle initialStatus={(dashboardHealer.availabilityStatus === "online" ? "online" : "offline")} />
                </div>

                <OverviewCards healer={dashboardHealer} />

                <div className="dashboard-grid">
                    <div className="dashboard-main">
                        <SessionList />
                        <ProgramsSection programs={programs} />
                    </div>
                    <div className="dashboard-sidebar">
                        <ProfileCompletenessCard />
                        <div className="dashboard-section">
                            <h3>⚡ Quick Actions</h3>
                            <div className="quick-actions">
                                <Link href="/healers" className="quick-action">
                                    <span>🌐</span> View Your Profile
                                </Link>
                                <Link href="/onboarding" className="quick-action">
                                    <span>✏️</span> Edit Profile
                                </Link>
                                <button type="button" className="quick-action">
                                    <span>📊</span> View Analytics
                                </button>
                                <button type="button" className="quick-action">
                                    <span>💬</span> Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
