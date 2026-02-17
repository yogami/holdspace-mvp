import Link from "next/link";
import { MODALITIES, type Healer } from "@/lib/constants";
import { getOnlineCount, getFeaturedHealers } from "@/lib/data";
import { TrustBadge } from "@/components/trust-badge";
import WaitlistForm from "@/components/waitlist-form";

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
        <li><Link href="/onboarding">For Healers</Link></li>
        <li><Link href="#waitlist" className="btn btn--primary btn--sm">Join Waitlist</Link></li>
      </ul>
    </nav>
  );
}

function HeroSection({ onlineCount }: { onlineCount: number }) {

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
            Our practitioners offer a range of holistic wellness modalities to support your journey.
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

function FeaturedHealers({ featured }: { featured: Healer[] }) {

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

function ForHealersSection() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
          <h2 className="animate-in">✨ For healers, by healers</h2>
          <p className="animate-in animate-in-delay-1" style={{ margin: "var(--space-md) auto 0", maxWidth: "600px", textAlign: "center" }}>
            HoldSpace is built for independent practitioners who want to reach people
            in their moment of need — without the overhead.
          </p>
        </div>
        <div className="healer-value-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-lg)" }}>
          <div className="card animate-in" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--space-md)" }}>💰</div>
            <h3 style={{ marginBottom: "var(--space-sm)" }}>Set your own rates</h3>
            <p className="text-muted">You decide what your time is worth. No platform fees during early access.</p>
          </div>
          <div className="card animate-in animate-in-delay-1" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--space-md)" }}>📅</div>
            <h3 style={{ marginBottom: "var(--space-sm)" }}>Your clients, your schedule</h3>
            <p className="text-muted">Toggle online when you&apos;re available. Seekers find you instantly — no back-and-forth.</p>
          </div>
          <div className="card animate-in animate-in-delay-2" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--space-md)" }}>🟢</div>
            <h3 style={{ marginBottom: "var(--space-sm)" }}>Real-time availability</h3>
            <p className="text-muted">Your profile lights up when you&apos;re ready. Seekers see who&apos;s available right now.</p>
          </div>
          <div className="card animate-in animate-in-delay-3" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--space-md)" }}>🛡️</div>
            <h3 style={{ marginBottom: "var(--space-sm)" }}>Trust &amp; safety built in</h3>
            <p className="text-muted">Trust scores, verified credentials, and safety reporting protect you and your clients.</p>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "var(--space-2xl)" }}>
          <Link href="/register" className="btn btn--primary btn--lg">
            Join as a healer →
          </Link>
          <p className="text-sm text-muted" style={{ marginTop: "var(--space-md)" }}>
            Early access — no fees, no commitment.
          </p>
        </div>
      </div>
    </section>
  );
}

function WaitlistSection() {
  return (
    <section className="section section--alt" id="waitlist">
      <div className="container">
        <div className="cta-section">
          <h2 className="animate-in">Be the first to know</h2>
          <p className="animate-in animate-in-delay-1">
            HoldSpace is launching soon. Join the waitlist to get early access — whether you&apos;re
            seeking support or offering it.
          </p>
          <WaitlistForm />
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
            <p className="footer__disclaimer">
              HoldSpace ist keine medizinische Plattform. Unsere Begleiter:innen bieten
              ganzheitliche Wellness-Begleitung an — keine Heilbehandlung oder Diagnose.
              Bei akuter Krise: Telefonseelsorge (0800 111 0 111) oder Notruf (112).
            </p>
            <p className="footer__disclaimer">
              HoldSpace connects seekers with independent holistic wellness facilitators.
              Sessions are for personal growth, relaxation, and well-being — not a replacement
              for professional medical or psychological services.
              If you&apos;re in crisis, please contact 988 Lifeline or your local emergency services.
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
              <li><Link href="/onboarding">Apply to Join</Link></li>
              <li><Link href="/dashboard">Healer Dashboard</Link></li>
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

export default async function Home() {
  const [onlineCount, featured] = await Promise.all([
    getOnlineCount(),
    getFeaturedHealers(3),
  ]);

  return (
    <>
      <Nav />
      <main>
        <HeroSection onlineCount={onlineCount} />
        <TrustBar />
        <HowItWorks />
        <Modalities />
        <FeaturedHealers featured={featured} />
        <ForHealersSection />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}
