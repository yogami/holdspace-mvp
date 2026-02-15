"use client";

import { useState } from "react";
import Link from "next/link";
import { MODALITIES } from "@/lib/constants";
import { SEED_HEALERS } from "@/lib/seed-data";
import { computeProgress, createProgram, enrollSeeker } from "@/lib/program-engine";
import type { Program, ProgramConfig } from "@/lib/program-types";
import "./dashboard.css";

// ─── Mock Data ──────────────────────────────────────────────────────────

const MOCK_HEALER = SEED_HEALERS[0];
const COMPLETENESS = 78;

const UPCOMING_SESSIONS = [
    { id: "s-001", seekerName: "Anonymous Seeker", modality: "breathwork", date: "Feb 16, 2026", time: "10:00", duration: 60, status: "confirmed" as const },
    { id: "s-002", seekerName: "Anonymous Seeker", modality: "somatic", date: "Feb 17, 2026", time: "14:30", duration: 90, status: "pending" as const },
];

const RECENT_SESSIONS = [
    { id: "s-003", seekerName: "Anonymous Seeker", modality: "breathwork", date: "Feb 14, 2026", duration: 60, status: "completed" as const, rating: 5 },
    { id: "s-004", seekerName: "Anonymous Seeker", modality: "meditation", date: "Feb 12, 2026", duration: 30, status: "completed" as const, rating: 4 },
    { id: "s-005", seekerName: "Anonymous Seeker", modality: "energy-healing", date: "Feb 10, 2026", duration: 60, status: "cancelled" as const, rating: null },
];

const SAMPLE_PROGRAMS: Program[] = [
    createProgram(MOCK_HEALER.id, {
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
];

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

function OverviewCards() {
    const trustTierEmoji: Record<string, string> = {
        new: "🌱", verified: "✅", established: "⚡", trusted: "💎",
    };

    return (
        <div className="dashboard-cards">
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">📅</span>
                <div className="dashboard-stat-card__value">{UPCOMING_SESSIONS.length}</div>
                <div className="dashboard-stat-card__label">Upcoming Sessions</div>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">{trustTierEmoji[MOCK_HEALER.trustTier]}</span>
                <div className="dashboard-stat-card__value">{MOCK_HEALER.trustScore}</div>
                <div className="dashboard-stat-card__label">Trust Score</div>
                <div className="dashboard-stat-card__sub badge badge--sage">{MOCK_HEALER.trustTier}</div>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">📊</span>
                <div className="dashboard-stat-card__value">{MOCK_HEALER.totalSessions}</div>
                <div className="dashboard-stat-card__label">Total Sessions</div>
            </div>
            <div className="dashboard-stat-card">
                <span className="dashboard-stat-card__icon">⭐</span>
                <div className="dashboard-stat-card__value">{MOCK_HEALER.avgRating}</div>
                <div className="dashboard-stat-card__label">Avg Rating ({MOCK_HEALER.totalReviews} reviews)</div>
            </div>
        </div>
    );
}

function AvailabilityToggle() {
    const [status, setStatus] = useState<"online" | "offline">("online");

    return (
        <div className="dashboard-availability">
            <div className={`availability availability--${status}`}>
                <span className="availability__dot" />
                <span>{status === "online" ? "You're online" : "You're offline"}</span>
            </div>
            <button
                type="button"
                className={`btn ${status === "online" ? "btn--sage btn--sm" : "btn--secondary btn--sm"}`}
                onClick={() => setStatus(status === "online" ? "offline" : "online")}
            >
                {status === "online" ? "Go Offline" : "Go Online"}
            </button>
        </div>
    );
}

function SessionList() {
    const statusStyle: Record<string, string> = {
        confirmed: "badge--sage",
        pending: "badge--gold",
        completed: "badge--sage",
        cancelled: "badge--terracotta",
    };

    return (
        <div className="dashboard-section">
            <h3>📅 Upcoming Sessions</h3>
            <div className="dashboard-session-list">
                {UPCOMING_SESSIONS.map((s) => {
                    const mod = MODALITIES.find((m) => m.id === s.modality);
                    return (
                        <div key={s.id} className="dashboard-session-item">
                            <div className="dashboard-session-item__icon">{mod?.icon}</div>
                            <div className="dashboard-session-item__details">
                                <div className="dashboard-session-item__title">{mod?.label} — {s.duration}min</div>
                                <div className="dashboard-session-item__meta text-sm text-muted">{s.date} at {s.time}</div>
                            </div>
                            <span className={`badge ${statusStyle[s.status]}`}>{s.status}</span>
                        </div>
                    );
                })}
            </div>

            <h3 style={{ marginTop: "var(--space-xl)" }}>📋 Recent Sessions</h3>
            <div className="dashboard-session-list">
                {RECENT_SESSIONS.map((s) => {
                    const mod = MODALITIES.find((m) => m.id === s.modality);
                    return (
                        <div key={s.id} className="dashboard-session-item">
                            <div className="dashboard-session-item__icon">{mod?.icon}</div>
                            <div className="dashboard-session-item__details">
                                <div className="dashboard-session-item__title">{mod?.label} — {s.duration}min</div>
                                <div className="dashboard-session-item__meta text-sm text-muted">{s.date} {s.rating ? `★ ${s.rating}` : ""}</div>
                            </div>
                            <span className={`badge ${statusStyle[s.status]}`}>{s.status}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ProgramsSection() {
    const [showBuilder, setShowBuilder] = useState(false);

    return (
        <div className="dashboard-section">
            <div className="dashboard-section__header">
                <h3>🌿 Your Programs</h3>
                <button type="button" className="btn btn--sage btn--sm" onClick={() => setShowBuilder(!showBuilder)}>
                    {showBuilder ? "Cancel" : "+ New Program"}
                </button>
            </div>

            {SAMPLE_PROGRAMS.map((prog) => (
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
    return (
        <div className="dashboard-layout">
            <DashboardNav />
            <div className="dashboard-container">
                <div className="dashboard-welcome animate-in">
                    <div>
                        <h1>Welcome back, {MOCK_HEALER.fullName.split(" ")[0]} 🌿</h1>
                        <p className="text-muted">Here&apos;s your practice at a glance.</p>
                    </div>
                    <AvailabilityToggle />
                </div>

                <OverviewCards />

                <div className="dashboard-grid">
                    <div className="dashboard-main">
                        <SessionList />
                        <ProgramsSection />
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
