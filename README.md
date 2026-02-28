# 🌿 HoldSpace

**The operating system for holistic healing — not just a marketplace.**

HoldSpace is a SaaS-enabled marketplace connecting seekers with verified breathwork guides, energy healers, and somatic practitioners. We provide the infrastructure practitioners need to run their practice (trust scoring, compliance, safety, payments) — and the real-time booking experience seekers deserve.

> *"BetterHelp owns therapy. Calm owns meditation apps. Nobody owns the trust & safety layer for holistic wellness."*

**Market:** Complementary & Alternative Medicine (CAM) is projected to reach **$1.4T by the early 2030s**. Somatic therapy and breathwork are seeing triple-digit growth among Millennials and Gen Z.

**Live:** [holdspace-mvp-production.up.railway.app](https://holdspace-mvp-production.up.railway.app)

---

## The Problem

- 🕐 **3-week wait times** for therapy appointments
- 💸 **$200+/session** for licensed therapists
- 🚫 **No marketplace** for holistic modalities (breathwork, energy healing, grief holding)
- ⚠️ **Zero trust infrastructure** — no verification, no safety reporting, no accountability
- 🍋 **"Lemon market"** — seekers can't distinguish masters from dangerous novices

## The Solution

Not a simple matchmaking marketplace — a **SaaS-enabled Marketplace (SeM)** that becomes infrastructure practitioners can't leave.

**For Seekers:**
- Browse healers by modality, see who's available *right now*
- Book instantly — 30, 60, or 90 minute video sessions
- Trust scores, verified credentials, and an SOS button if anything feels wrong

**For Healers ("Business-in-a-Box"):**
- Set your own rates, toggle online when you're ready
- Trust tiers that reward reliability (New → Verified → Established → Trusted)
- Legal compliance engine (Heilpraktiker classification, prohibited term detection)
- Safety infrastructure you can't build yourself (SOS, reporting, auto-suspend)

---

## What's Built

| Layer | Components |
|---|---|
| **Trust Engine** | 6-factor weighted scoring (verification, sessions, ratings, safety, reliability, age), 4-tier system, auto-suspend on critical reports |
| **Session Machine** | State machine (pending → confirmed → active → completed), SOS button with location, cancellation penalties |
| **Onboarding** | Healer registration, Heilpraktiker vs. wellness-practitioner classification, prohibited medical term detection |
| **Programs** | Multi-session healing journeys with milestones and intention prompts |
| **Safety** | Report categories (harassment, misrepresentation, no-show, safety concern), severity tiers, auto-escalation |
| **Frontend** | Landing page, healer directory with filtering, healer profiles, booking flow, review system, waitlist |

## Modalities

| Modality | Description |
|---|---|
| 🌬️ Breathwork | Guided breathing for calm and release |
| ✨ Energy Healing | Reiki, pranic, and subtle body work |
| 🧘 Somatic Work | Body-based trauma release |
| 🤲 Grief Holding | Compassionate space for loss |
| 🎵 Sound Healing | Singing bowls, tones, and vibration |
| 🪷 Meditation | Guided presence and stillness |
| 🌊 Nervous System | Vagal toning and co-regulation |
| 💧 Emotional Release | Safe space for big feelings |

---

## Strategic Model

**Why SaaS-enabled, not just marketplace:**
Pure marketplaces suffer from the "leakage trap" — once trust is established, practitioners take clients off-platform. HoldSpace prevents this by providing value that only works *on-platform*: trust scoring, compliance, safety reporting, SOS protocol, and (planned) group liability insurance.

**Launch strategy:** Berlin first. The compliance engine (Heilpraktiker classification, prohibited term detection, auto-disclaimers) is already built — turning Germany's hardest regulatory barrier into a moat that competitors can't easily replicate. B2B wedge: sell wellness credits to Berlin startups and corporates dealing with burnout culture.

**Competitive graveyard lessons:** WellSet pivoted B2B (retail CAC too high). Insight Timer has high engagement but low monetization. Heal & Sprig failed on unit economics.

---

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Auth:** Custom session-based
- **Testing:** Playwright E2E (12 spec files) + unit tests
- **Deployment:** Railway
- **Architecture:** Pure-function domain engines (trust, onboarding, session, program) — stateless, deterministic, fully testable

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/holdspace-mvp.git
cd holdspace-mvp
npm install
cp .env.local.example .env.local  # add your DB + API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing

```bash
# E2E tests
npx playwright test

# Specific engine tests
npx playwright test e2e/trust-engine.spec.ts
npx playwright test e2e/onboarding-engine.spec.ts
npx playwright test e2e/session-machine.spec.ts
npx playwright test e2e/program-engine.spec.ts
```

## Project Structure

```
src/
├── app/                    # Next.js pages + API routes
│   ├── api/                # REST endpoints (healers, sessions, safety-reports, waitlist)
│   ├── healers/            # Healer directory + profiles
│   ├── session/            # Booking, review, safety reporting
│   ├── onboarding/         # Healer registration flow
│   └── dashboard/          # Healer dashboard
├── components/             # React components (TrustBadge, WaitlistForm)
└── lib/                    # Domain engines (pure functions)
    ├── trust-engine.ts     # Trust scoring + tier mapping
    ├── trust-types.ts      # Type system for trust, safety, sessions
    ├── session-machine.ts  # Session state machine + SOS
    ├── onboarding-engine.ts # Healer registration + compliance
    ├── program-engine.ts   # Multi-session programs
    ├── schema.ts           # Drizzle DB schema
    └── constants.ts        # Modalities, durations, availability
```

## Legal

HoldSpace connects seekers with independent holistic wellness facilitators. Sessions are for personal growth, relaxation, and well-being — not a replacement for professional medical or psychological services. German Heilpraktiker regulations are enforced at the onboarding level.

## License

MIT

---

Built with care in Berlin 🇩🇪
