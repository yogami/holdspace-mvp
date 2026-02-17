"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Step 1: Create account
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Registration failed.");
            setLoading(false);
            return;
        }

        // Step 2: Auto sign-in
        const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (signInRes?.error) {
            setError("Account created but login failed. Please sign in.");
            router.push("/login");
        } else {
            router.push("/onboarding");
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <Link href="/" className="auth-logo">🌿 HoldSpace</Link>
                    <h1>Begin your journey</h1>
                    <p className="text-muted">Create your healer profile</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <label>
                        <span>Full Name</span>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Aria Moon"
                            required
                            autoComplete="name"
                        />
                    </label>

                    <label>
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </label>

                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                            autoComplete="new-password"
                        />
                    </label>

                    <button
                        type="submit"
                        className="btn btn--primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link href="/login">Sign in</Link>
                </p>
                <p className="auth-footer">
                    Looking for a healer?{" "}
                    <Link href="/register/seeker">Join as a seeker</Link>
                </p>
            </div>
        </main>
    );
}
