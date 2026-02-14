"use client";

import { useState } from "react";
import Link from "next/link";
import { MODALITIES } from "@/lib/constants";
import { SEED_HEALERS } from "@/lib/seed-data";

function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav__logo">
        <span className="nav__logo-icon">🌿</span>
        HoldSpace
      </Link>
      <ul className="nav__links">
        <li><Link href="/healers">Find a Healer</Link></li>
        <li><Link href="#how-it-works">How It Works</Link></li>
        <li><Link href="#waitlist" className="btn btn--primary btn--sm">Join Waitlist</Link></li>
      </ul>
    </nav>
  );
}

function HeroSection() {
  const onlineCount = SEED_HEALERS.filter(h => h.availabilityStatus === "online").length;

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__content animate-in">
          <div className="availability availability--online" style={{ marginBottom: "var(--space-lg)" }}>
            <span className="availability__dot"></span>
            <span>{onlineCount} healers available right now</span>
          </div>
          <h1>
            Find your healer.<br />
            <em>Right now.</em>
          </h1>
          <p>
            When life gets heavy, you don&apos;t need to wait 3 weeks for an appointment.
            Connect instantly with breathwork guides, energy workers, and somatic healers
            who are online and ready to hold space for you.
          </p>
          <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
            <Link href="/healers" className="btn btn--primary btn--lg">
              Browse Healers
            </Link>
            <a href="#waitlist" className="btn btn--secondary btn--lg">
              Join the Waitlist
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="trust-bar animate-in animate-in-delay-1">
      <div className="trust-item">
        <span className="trust-item__icon">🛡️</span>
        <span>Every healer verified</span>
      </div>
      <div className="trust-item">
        <span className="trust-item__icon">🔒</span>
        <span>Private &amp; confidential</span>
      </div>
      <div className="trust-item">
        <span className="trust-item__icon">💛</span>
        <span>Pay only for your time</span>
      </div>
      <div className="trust-item">
        <span className="trust-item__icon">📱</span>
        <span>Video sessions from anywhere</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="section section--alt" id="how-it-works">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
          <h2 className="animate-in">How it works</h2>
          <p className="animate-in animate-in-delay-1" style={{ margin: "var(--space-md) auto 0", textAlign: "center" }}>
            From feeling overwhelmed to feeling held — in three simple steps.
          </p>
        </div>
        <div className="steps">
          <div className="step animate-in animate-in-delay-1">
            <div className="step__number">1</div>
            <h3>Browse &amp; choose</h3>
            <p>
              Filter by what you need — breathwork, energy healing, grief support.
              See who&apos;s available right now with real-time status.
            </p>
          </div>
          <div className="step animate-in animate-in-delay-2">
            <div className="step__number">2</div>
            <h3>Book instantly</h3>
            <p>
              Choose your session length, pay securely, and get connected.
              No forms, no intake questionnaires, no waiting.
            </p>
          </div>
          <div className="step animate-in animate-in-delay-3">
            <div className="step__number">3</div>
            <h3>Be held</h3>
            <p>
              Join a private video session with your healer.
              Breathe, release, and let someone hold space for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Modalities() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
          <h2 className="animate-in">What kind of support are you looking for?</h2>
          <p className="animate-in animate-in-delay-1" style={{ margin: "var(--space-md) auto 0", textAlign: "center" }}>
            Our healers specialize in a range of modalities. All are non-clinical wellness practices.
          </p>
        </div>
        <div className="modality-grid">
          {MODALITIES.map((mod, i) => (
            <Link
              href={`/healers?modality=${mod.id}`}
              key={mod.id}
              className={`modality-card animate-in animate-in-delay-${Math.min(i + 1, 4)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="modality-card__icon">{mod.icon}</span>
              <h4>{mod.label}</h4>
              <p>{mod.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedHealers() {
  const featured = SEED_HEALERS.filter(h => h.availabilityStatus === "online").slice(0, 3);

  return (
    <section className="section section--alt">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
          <h2 className="animate-in">Available right now</h2>
          <p className="animate-in animate-in-delay-1" style={{ margin: "var(--space-md) auto 0", textAlign: "center" }}>
            These healers are online and ready to hold space for you.
          </p>
        </div>
        <div className="healer-grid">
          {featured.map((healer) => (
            <Link
              href={`/healers/${healer.id}`}
              key={healer.id}
              className="healer-card animate-in"
            >
              <img
                className="healer-card__image"
                src={healer.avatarUrl}
                alt={healer.fullName}
                loading="lazy"
              />
              <div className="healer-card__body">
                <div className="healer-card__header">
                  <div>
                    <div className="healer-card__name">{healer.fullName}</div>
                    <div className="healer-card__modalities">
                      {healer.modalities.slice(0, 2).map(m => {
                        const mod = MODALITIES.find(mod => mod.id === m);
                        return (
                          <span key={m} className="badge badge--sage">
                            {mod?.icon} {mod?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className={`availability availability--${healer.availabilityStatus}`}>
                    <span className="availability__dot"></span>
                  </div>
                </div>
                <p className="healer-card__bio">{healer.bio}</p>
                <div className="healer-card__footer">
                  <div className="rating-summary">
                    <span className="stars">★</span>
                    <span className="rating-number">{healer.avgRating}</span>
                    <span className="text-sm text-muted">({healer.totalReviews})</span>
                  </div>
                  <div className="healer-card__price">
                    ${healer.hourlyRate}<span>/hr</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "var(--space-2xl)" }}>
          <Link href="/healers" className="btn btn--secondary">
            See all healers →
          </Link>
        </div>
      </div>
    </section>
  );
}

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("seeker");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="section" id="waitlist">
      <div className="container">
        <div className="cta-section">
          <h2 className="animate-in">Be the first to know</h2>
          <p className="animate-in animate-in-delay-1">
            HoldSpace is launching soon. Join the waitlist to get early access — whether you&apos;re
            seeking support or offering it.
          </p>
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
            </div>
          ) : (
            <div className="waitlist-success animate-in" style={{ justifyContent: "center", color: "white" }}>
              <span>🌿</span> You&apos;re on the list! We&apos;ll be in touch soon.
            </div>
          )}
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
              A marketplace for wellness facilitation — not healthcare.
            </p>
            <p className="footer__disclaimer">
              HoldSpace connects seekers with independent wellness facilitators.
              Our services are not a substitute for medical care, therapy, or
              professional mental health treatment. If you&apos;re in crisis, please
              contact the 988 Suicide &amp; Crisis Lifeline or your local emergency services.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/healers">Find a Healer</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#waitlist">Join Waitlist</a></li>
            </ul>
          </div>
          <div>
            <h4>For Healers</h4>
            <ul>
              <li><a href="#waitlist">Apply to Join</a></li>
              <li><a href="#">Healer Guidelines</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
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

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <TrustBar />
        <HowItWorks />
        <Modalities />
        <FeaturedHealers />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}
