"use client";

import { useState } from "react";

export default function WaitlistForm() {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<string>("seeker");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSubmitted(true);
                setError("");
            } else {
                const data = await res.json();
                setError(data.error || "Something went wrong.");
            }
        } catch {
            setError("Network error. Please try again.");
        }
    };

    return (
        <>
            {!submitted ? (
                <div className="animate-in animate-in-delay-2">
                    <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
                        <button
                            className={`filter-pill ${role === "seeker" ? "filter-pill--active" : ""}`}
                            onClick={() => setRole("seeker")}
                            style={{ borderColor: role === "seeker" ? "white" : "rgba(255,255,255,0.3)", color: "white", background: role === "seeker" ? "rgba(255,255,255,0.2)" : "transparent" }}
                        >
                            🙏 I&apos;m seeking
                        </button>
                        <button
                            className={`filter-pill ${role === "healer" ? "filter-pill--active" : ""}`}
                            onClick={() => setRole("healer")}
                            style={{ borderColor: role === "healer" ? "white" : "rgba(255,255,255,0.3)", color: "white", background: role === "healer" ? "rgba(255,255,255,0.2)" : "transparent" }}
                        >
                            ✨ I&apos;m a healer
                        </button>
                    </div>
                    <form className="waitlist-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn--primary">
                            Join Waitlist
                        </button>
                    </form>
                    {error && <p style={{ color: "#FEB2B2", marginTop: "var(--space-sm)", textAlign: "center" }}>{error}</p>}
                </div>
            ) : (
                <div className="waitlist-success animate-in" style={{ justifyContent: "center", color: "white" }}>
                    <span>🌿</span> You&apos;re on the list! We&apos;ll be in touch soon.
                </div>
            )}
        </>
    );
}
