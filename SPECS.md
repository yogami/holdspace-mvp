# HoldSpace — Product Specifications

## Vision

A trust-first **SaaS-enabled Marketplace (SeM)** for on-demand holistic wellness. Not a simple matchmaker — an operating system for healers that provides the infrastructure (trust scoring, compliance, safety, insurance) they can't build alone, wrapped in a real-time booking experience for seekers.

**Strategic Verdict (Deep Research):** *"GO, but with major structural caveats."* Must evolve beyond simple marketplace to avoid the leakage trap.

---

## Market Context

**Category:** Holistic Wellness Marketplace (B2C two-sided, evolving to B2B2C)

**Market Size:** Complementary & Alternative Medicine (CAM) projected to reach **$1.4 trillion by early 2030s**. Somatic therapy and breathwork are seeing triple-digit growth among Millennials and Gen Z ("clinical over clean" wellness).

**Regional Insights:**
- **DACH (Germany):** $281B market, 3rd largest globally — but extreme regulatory risk (Heilpraktikergesetz)
- **USA:** $2.1T volume leader. High growth in "remedial" wellness due to accessible mental healthcare collapse
- **UK:** Fastest growth, permissive Common Law environment — best launch market

**Not therapy.** HoldSpace is explicitly positioned as wellness facilitation, not healthcare. This is legally critical — practitioners are either licensed Heilpraktiker or wellness facilitators with mandatory disclaimers.

**No incumbent owns this.** BetterHelp/Talkspace own online therapy. Calm/Headspace own meditation apps. Mindbody owns fitness studios. Nobody owns the on-demand layer for breathwork, energy healing, somatic work, and grief holding.

---

## Competitive Graveyard (Lessons Learned)

| Company | What Happened | Our Takeaway |
|---|---|---|
| **WellSet** | Pivoted from D2C to B2B — retail CAC too high | Build B2B wedge (employer wellness credits) from day one |
| **Insight Timer** | High engagement, low monetization for teachers — used for lead gen only | Practitioners must earn *more* on-platform than off |
| **BetterHelp** | Criticized for therapist churn, commoditization of care | Trust scoring prevents race-to-bottom; quality > volume |
| **Heal & Sprig** | Failed on unit economics and logistics | Video-first = no logistics overhead |

---

## The Leakage Trap

The #1 existential risk for wellness marketplaces: once trust is established between practitioner and client, they move off-platform to avoid fees.

**Our defense (the "Moat Stack"):**
1. **Trust Score** — only works on-platform; leaving resets your score
2. **Safety Infrastructure** — SOS button, safety reporting, auto-suspend can't be replicated solo
3. **Compliance Engine** — prohibited term detection, Heilpraktiker classification, auto-disclaimers
4. **Planned: Group Liability Insurance** — only available to on-platform practitioners
5. **Planned: Verifiable Credentials (W3C VCs)** — cryptographic proof of certifications, portable but platform-issued

---

## Users

### Seekers (Demand Side)
People experiencing acute emotional distress, burnout, grief, or anxiety who want immediate human connection — not an app, not a chatbot, not a 3-week waitlist.

**Key moments:** Post-breakup, work burnout, grief, panic, Sunday evening dread.

### Healers (Supply Side)
Independent holistic practitioners (breathwork facilitators, Reiki practitioners, somatic therapists, grief counselors) who want clients without building their own brand/website/booking system.

**Key pain:** Client acquisition, no-shows, marketing overhead.

---

## Core Features

### 1. Trust Engine
The central differentiator. Every healer gets a composite trust score (0–100) based on 6 weighted factors:

| Factor | Weight | Signal |
|---|---|---|
| Verification | 25% | Identity, credentials, background check |
| Session History | 20% | Total sessions (logarithmic curve) |
| Rating | 20% | Avg rating × review count confidence |
| Safety Record | 20% | Inverse of open/critical reports |
| Reliability | 10% | Cancellation rate + response time |
| Account Age | 5% | Longevity bonus |

**Trust Tiers:** New (0-29) → Verified (30-59) → Established (60-84) → Trusted (85-100)

**Auto-suspend:** 3+ critical open reports triggers automatic suspension.

### 2. Session State Machine
Strict lifecycle management:

```
pending → confirmed → active → completed
                ↘              ↘
              cancelled      reported (via SOS)
```

- **SOS Button:** Either party can trigger SOS during active sessions. Captures timestamp + optional location. Force-ends the session.
- **Cancellation Penalties:** Grace period (24h), then: warning → cooldown → suspension.
- **Healer Availability:** Automatically set to "busy" when in active session.

### 3. Healer Onboarding
6-step registration with compliance enforcement:

1. **Profile** — Name, bio (min 50 chars), languages
2. **Modalities** — Select from 8 supported modalities
3. **Credentials** — Upload certifications (optional)
4. **Legal** — Heilpraktiker license OR wellness-practitioner disclaimer
5. **Social** — Instagram, website (optional)
6. **Review** — Final validation before submission

**Prohibited terms detection:** Automatically flags medical language ("therapy", "treatment", "diagnosis", "cure", "Heilung", "Behandlung", "Diagnose") in practitioner bios and descriptions.

**Practitioner classification:**
- `heilpraktiker` — Has HP license number (German alternative medicine practitioner)
- `wellness-practitioner` — Accepted disclaimer, no medical claims
- `unclassified` — Incomplete legal step

### 4. Multi-Session Programs
Healers can create structured healing journeys:
- Define milestones with intention prompts
- Sequential enforcement (must complete step N before N+1)
- Progress tracking (percentage, completed steps)
- Pre/post session reflections

### 5. Safety Reporting
Post-session reporting with categorized concerns:
- Inappropriate behavior
- Harassment or threats
- No-show
- Misrepresentation of qualifications
- "I felt unsafe"

Reports feed into the trust engine. Severity levels: low → medium → high → critical.

---

## Revenue Model

| Stream | Pricing | Notes |
|---|---|---|
| Platform commission | 15–20% per session | Standard marketplace take |
| B2B wellness credits | Enterprise pricing | Employers buy credits for employees |
| Premium healer tier | $X/month | Analytics, scheduling tools, priority placement |
| Group liability insurance | Bundled or add-on | Key retention moat |

---

## Launch Strategy

**Berlin first.** We're based here, the healer network is here, and the compliance engine is already built.

| Phase | Focus | Why |
|---|---|---|
| **Phase 1** | Berlin — 10 healers, B2B pilot | Network advantage + Heilpraktiker compliance already coded |
| **Phase 2** | DACH expansion (Hamburg, Munich, Vienna) | Same legal framework, proven playbook |
| **Phase 3** | UK + US Safe Harbor states | English-language expansion with lighter regulation |

**The Heilpraktiker paradox:** Germany's strict Heilpraktikergesetz is cited as a risk to *defer* — but for us it's a **moat**. Our compliance engine (practitioner classification, prohibited term detection, bilingual auto-disclaimers) is already built. Any competitor entering Germany would need to build this from scratch.

**B2B Wedge:** Sell wellness credits to Berlin startups and corporates. Tech burnout culture in Berlin is acute — WeWork, Stripe, N26 all have wellness budgets. Guarantees practitioner demand from day one and solves the cold-start problem.

---

## Regulatory Awareness

| Regulation | How We Handle It |
|---|---|
| German Heilpraktiker law (HeilprG) | Practitioner type classification at onboarding; prohibited term detection |
| GDPR | Data minimization; no unnecessary PII collection |
| Medical disclaimer | Auto-generated bilingual disclaimers (DE/EN) based on practitioner type |
| Duty of care | SOS button, safety reporting, auto-suspend, crisis hotline links in footer |

---

## Technical Architecture

**Philosophy:** Pure-function domain engines. All business logic is stateless, deterministic, and fully testable. No side effects in the domain layer.

| Engine | File | Responsibility |
|---|---|---|
| Trust Engine | `src/lib/trust-engine.ts` | Score computation, tier mapping, auto-suspend, booking eligibility |
| Session Machine | `src/lib/session-machine.ts` | State transitions, SOS handling, healer availability |
| Onboarding Engine | `src/lib/onboarding-engine.ts` | Step validation, prohibited term detection, practitioner classification |
| Program Engine | `src/lib/program-engine.ts` | Program creation, enrollment, advancement, progress tracking |

**Stack:** Next.js App Router · TypeScript · Neon PostgreSQL · Drizzle ORM · Playwright · Railway

---

## Test Coverage

| Spec File | What It Tests |
|---|---|
| `trust-engine.spec.ts` | Score computation, tier boundaries, auto-suspend, cancellation penalties, booking eligibility |
| `onboarding-engine.spec.ts` | Step validation, prohibited terms (DE+EN), practitioner classification, completeness |
| `session-machine.spec.ts` | State transitions, SOS flow, invalid transition rejection, healer availability |
| `program-engine.spec.ts` | Program creation, enrollment, advancement, progress, sequential enforcement |
| `api-integration.spec.ts` | API route responses, error handling |
| `browser/*.spec.ts` | E2E browser flows (7 spec files) |
