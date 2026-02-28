import Link from "next/link";
import WaitlistForm from "@/components/waitlist-form";

function Nav() {
    return (
        <nav className="nav">
            <Link href="/" className="nav__logo">
                <span className="nav__logo-icon">🌿</span>
                HoldSpace
            </Link>
            <ul className="nav__links">
                <li><Link href="/healers">Find Support</Link></li>
                <li><Link href="/#how-it-works">How It Works</Link></li>
                <li><Link href="/for-healers">For Healers</Link></li>
                <li><Link href="/login" className="btn btn--secondary btn--sm">Sign In</Link></li>
            </ul>
        </nav>
    );
}

function HeroSection() {
    return (
        <section className="hero" style={{ background: "var(--cream)" }}>
            <div className="container">
                <div className="hero__content animate-in" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
                    <h1 style={{ marginBottom: "var(--space-md)" }}>
                        Hold space for others.<br />
                        <em style={{ color: "var(--terracotta)" }}>While we hold space for your practice.</em>
                    </h1>
                    <p style={{ margin: "0 auto var(--space-xl)", maxWidth: "600px" }}>
                        HoldSpace is a sanctuary for breathwork guides, energy workers, and somatic healers.
                        Connect with seekers the moment they need you, without the administrative friction.
                    </p>
                    <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/register" className="btn btn--primary btn--lg">
                            Apply to Join
                        </Link>
                        <Link href="#values" className="btn btn--secondary btn--lg">
                            How it Works
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ValueProps() {
    return (
        <section className="section section--alt" id="values">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
                    <h2 className="animate-in">Built for healers, by healers.</h2>
                    <p className="animate-in animate-in-delay-1" style={{ margin: "var(--space-md) auto 0", maxWidth: "600px" }}>
                        We removed the barriers between your calling and those seeking guidance, creating an ethical, serene environment for you to share your gifts.
                    </p>
                </div>
                <div className="healer-value-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-lg)" }}>
                    <div className="card animate-in" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}>🌿</div>
                        <h3 style={{ marginBottom: "var(--space-sm)" }}>Ethical Exchange</h3>
                        <p className="text-muted">Set your own rates and keep 100% of your earnings during our early access period. No hidden fees.</p>
                    </div>
                    <div className="card animate-in animate-in-delay-1" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}>🟢</div>
                        <h3 style={{ marginBottom: "var(--space-sm)" }}>Real-Time Connection</h3>
                        <p className="text-muted">Toggle your availability to 'online' when you're ready to hold a session. Seekers connect with you instantly.</p>
                    </div>
                    <div className="card animate-in animate-in-delay-2" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}>🕊️</div>
                        <h3 style={{ marginBottom: "var(--space-sm)" }}>Frictionless Practice</h3>
                        <p className="text-muted">Zero intake forms, zero scheduling tennis. Focus entirely on the healing work while we handle the rest.</p>
                    </div>
                    <div className="card animate-in animate-in-delay-3" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}>🛡️</div>
                        <h3 style={{ marginBottom: "var(--space-sm)" }}>A Safely Held Container</h3>
                        <p className="text-muted">Verified trust badges, clear boundaries, and robust reporting mechanisms to protect both practitioner and seeker.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Testimonial() {
    return (
        <section className="section" style={{ background: "var(--sage-light)", color: "var(--charcoal)" }}>
            <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontStyle: "italic", marginBottom: "var(--space-lg)", lineHeight: 1.4 }}>
                    "Before HoldSpace, I spent half my week managing bookings and social media just to find clients. Now, I simply open my laptop, brew tea, drop into the flow state, and hold space for whoever finds me in that moment."
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-md)" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                        🌙
                    </div>
                    <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600 }}>Aria T.</div>
                        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>Somatic Breathwork Facilitator</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ApplicationSection() {
    return (
        <section className="section">
            <div className="container">
                <div className="cta-section" style={{ background: "var(--warm-white)", border: "1px solid var(--linen)", borderRadius: "var(--radius-xl)", padding: "var(--space-3xl) var(--space-xl)", textAlign: "center" }}>
                    <h2 className="animate-in">Ready to share your gifts?</h2>
                    <p className="animate-in animate-in-delay-1" style={{ margin: "var(--space-md) auto var(--space-xl)", maxWidth: "500px" }}>
                        Join our curated community of holistic wellness facilitators. The application takes about 5 minutes.
                    </p>
                    <div className="animate-in animate-in-delay-2">
                        <Link href="/register" className="btn btn--primary btn--lg">
                            Begin Application →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <h4>🌿 HoldSpace</h4>
                        <p>
                            Warm, human connection when you need it most.
                            A marketplace for holistic wellness facilitation.
                        </p>
                    </div>
                    <div>
                        <h4>Explore</h4>
                        <ul>
                            <li><Link href="/healers">Find Support</Link></li>
                            <li><Link href="/#how-it-works">How It Works</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>For Healers</h4>
                        <ul>
                            <li><Link href="/for-healers">Join as a Practitioner</Link></li>
                            <li><Link href="/dashboard">Healer Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Support</h4>
                        <ul>
                            <li><Link href="/login">Sign In</Link></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer__bottom">
                    <span>© 2026 HoldSpace. All rights reserved.</span>
                    <span>This is wellness facilitation, not healthcare.</span>
                </div>
            </div>
        </footer>
    );
}

export default function ForHealersPage() {
    return (
        <>
            <Nav />
            <main>
                <HeroSection />
                <ValueProps />
                <Testimonial />
                <ApplicationSection />
            </main>
            <Footer />
        </>
    );
}
