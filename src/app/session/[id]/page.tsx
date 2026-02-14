"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SEED_HEALERS } from "@/lib/seed-data";

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const healerId = params.id as string;
    const healer = SEED_HEALERS.find(h => h.id === healerId);

    const [elapsed, setElapsed] = useState(0);
    const [sessionActive, setSessionActive] = useState(true);

    useEffect(() => {
        if (!sessionActive) return;
        const interval = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionActive]);

    const formatTime = useCallback((seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }, []);

    const handleEndSession = () => {
        setSessionActive(false);
        router.push(`/session/${healerId}/review`);
    };

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

    return (
        <div className="session-container">
            <div className="session-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                    <Link href="/" className="nav__logo" style={{ color: "white", fontSize: "1.2rem" }}>
                        <span className="nav__logo-icon">🌿</span>
                        HoldSpace
                    </Link>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>Session with {healer.fullName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)" }}>
                    <div className="session-timer">{formatTime(elapsed)}</div>
                    <button className="btn--end" onClick={handleEndSession}>
                        End Session
                    </button>
                </div>
            </div>

            <div className="session-video">
                {/* Daily.co would be embedded here in production */}
                <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    color: "white",
                    gap: "var(--space-lg)",
                }}>
                    <div style={{ fontSize: "4rem" }}>🌿</div>
                    <h2 style={{ color: "white", fontFamily: "var(--font-heading)" }}>
                        Your session is in progress
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", maxWidth: 420 }}>
                        In the live version, your video call with {healer.fullName} would appear here via Daily.co.
                    </p>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "var(--space-lg)",
                        marginTop: "var(--space-xl)",
                    }}>
                        <div style={{
                            width: 200,
                            height: 150,
                            borderRadius: "var(--radius-lg)",
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "var(--space-sm)",
                        }}>
                            <img
                                src={healer.avatarUrl}
                                alt={healer.fullName}
                                style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }}
                            />
                            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{healer.fullName}</span>
                        </div>
                        <div style={{
                            width: 200,
                            height: 150,
                            borderRadius: "var(--radius-lg)",
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "var(--space-sm)",
                        }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: "50%",
                                background: "rgba(255,255,255,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.5rem"
                            }}>
                                🙏
                            </div>
                            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>You</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
