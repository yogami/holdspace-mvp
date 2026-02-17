"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MODALITIES, LANGUAGES } from "@/lib/constants";
import {
    type HealerApplication,
    type OnboardingStep,
    ONBOARDING_STEPS,
} from "@/lib/onboarding-types";
import {
    validateStep,
    canAdvance,
    computeCompleteness,
    classifyPractitioner,
    flagProhibitedTerms,
    generateDisclaimerText,
} from "@/lib/onboarding-engine";
import "./onboarding.css";

const STEP_META: Record<OnboardingStep, { label: string; icon: string; description: string }> = {
    profile: { label: "Profile", icon: "👤", description: "Tell seekers about yourself" },
    modalities: { label: "Modalities", icon: "🌿", description: "What do you offer?" },
    credentials: { label: "Credentials", icon: "📜", description: "Your training & certifications" },
    legal: { label: "Legal", icon: "⚖️", description: "Practitioner classification" },
    social: { label: "Social", icon: "🔗", description: "Connect your profiles" },
    review: { label: "Review", icon: "✨", description: "Review & submit" },
};

function emptyApplication(): HealerApplication {
    return {
        profile: { fullName: "", bio: "", languages: [], avatarUrl: "" },
        modalities: [],
        credentials: [],
        legal: { type: "none", hpLicenseNumber: null, disclaimerAccepted: false },
        social: { instagramHandle: null, websiteUrl: null, meetingUrl: null },
    };
}

// ─── Step Components ─────────────────────────────────────────────────────

function ProfileStep({ app, onUpdate }: { app: HealerApplication; onUpdate: (a: HealerApplication) => void }) {
    const bioFlags = app.profile.bio.length > 10 ? flagProhibitedTerms(app.profile.bio) : { clean: true, flagged: [] };

    return (
        <div className="onboarding-step">
            <div className="input-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={app.profile.fullName}
                    onChange={(e) => onUpdate({ ...app, profile: { ...app.profile, fullName: e.target.value } })}
                />
            </div>
            <div className="input-group">
                <label htmlFor="bio">Bio * <span className="text-sm text-muted">({app.profile.bio.length}/50 min)</span></label>
                <textarea
                    id="bio"
                    placeholder="Describe your practice and what seekers can expect..."
                    rows={4}
                    value={app.profile.bio}
                    onChange={(e) => onUpdate({ ...app, profile: { ...app.profile, bio: e.target.value } })}
                />
                {!bioFlags.clean && (
                    <div className="onboarding-warning">
                        ⚠️ Flagged terms: <strong>{bioFlags.flagged.join(", ")}</strong>. As a holistic wellness facilitator, please avoid language that implies medical or psychological services.
                    </div>
                )}
            </div>
            <div className="input-group">
                <label>Languages *</label>
                <div className="chip-grid">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            className={`chip ${app.profile.languages.includes(lang) ? "chip--active" : ""}`}
                            onClick={() => {
                                const langs = app.profile.languages.includes(lang)
                                    ? app.profile.languages.filter((l) => l !== lang)
                                    : [...app.profile.languages, lang];
                                onUpdate({ ...app, profile: { ...app.profile, languages: langs } });
                            }}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ModalitiesStep({ app, onUpdate }: { app: HealerApplication; onUpdate: (a: HealerApplication) => void }) {
    return (
        <div className="onboarding-step">
            <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                Select the modalities you offer. Seekers will use these to find you.
            </p>
            <div className="modality-select-grid">
                {MODALITIES.map((mod) => (
                    <button
                        key={mod.id}
                        type="button"
                        className={`modality-select-card ${app.modalities.includes(mod.id) ? "modality-select-card--active" : ""}`}
                        onClick={() => {
                            const mods = app.modalities.includes(mod.id)
                                ? app.modalities.filter((m) => m !== mod.id)
                                : [...app.modalities, mod.id];
                            onUpdate({ ...app, modalities: mods });
                        }}
                    >
                        <span className="modality-select-card__icon">{mod.icon}</span>
                        <span className="modality-select-card__label">{mod.label}</span>
                        <span className="modality-select-card__desc">{mod.description}</span>
                        {app.modalities.includes(mod.id) && <span className="modality-select-card__check">✓</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

function CredentialsStep({ app, onUpdate }: { app: HealerApplication; onUpdate: (a: HealerApplication) => void }) {
    const addCredential = () => {
        onUpdate({
            ...app,
            credentials: [...app.credentials, { name: "", issuer: "", year: new Date().getFullYear() }],
        });
    };

    const updateCredential = (index: number, field: string, value: string | number) => {
        const updated = app.credentials.map((c, i) => (i === index ? { ...c, [field]: value } : c));
        onUpdate({ ...app, credentials: updated });
    };

    const removeCredential = (index: number) => {
        onUpdate({ ...app, credentials: app.credentials.filter((_, i) => i !== index) });
    };

    return (
        <div className="onboarding-step">
            <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                Add your training and certifications. This is optional but increases your trust score.
            </p>
            {app.credentials.map((cred, i) => (
                <div key={i} className="credential-card">
                    <button type="button" className="credential-card__remove" onClick={() => removeCredential(i)}>✕</button>
                    <div className="input-group">
                        <label>Certification Name</label>
                        <input type="text" placeholder="e.g. Holotropic Breathwork Facilitator" value={cred.name} onChange={(e) => updateCredential(i, "name", e.target.value)} />
                    </div>
                    <div className="credential-row">
                        <div className="input-group">
                            <label>Issuing Organization</label>
                            <input type="text" placeholder="e.g. Grof Transpersonal Training" value={cred.issuer} onChange={(e) => updateCredential(i, "issuer", e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Year</label>
                            <input type="number" min={1990} max={2026} value={cred.year} onChange={(e) => updateCredential(i, "year", parseInt(e.target.value))} />
                        </div>
                    </div>
                </div>
            ))}
            <button type="button" className="btn btn--secondary" onClick={addCredential}>
                + Add Credential
            </button>
        </div>
    );
}

function LegalStep({ app, onUpdate }: { app: HealerApplication; onUpdate: (a: HealerApplication) => void }) {
    return (
        <div className="onboarding-step">
            <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                German law requires us to distinguish Heilpraktiker from wellness facilitators.
            </p>
            <div className="legal-options">
                <button
                    type="button"
                    className={`legal-option ${app.legal.type === "heilpraktiker" ? "legal-option--active" : ""}`}
                    onClick={() => onUpdate({ ...app, legal: { ...app.legal, type: "heilpraktiker", disclaimerAccepted: false } })}
                >
                    <span className="legal-option__icon">🏥</span>
                    <span className="legal-option__title">Heilpraktiker</span>
                    <span className="legal-option__desc">I hold a valid Heilpraktiker license</span>
                </button>
                <button
                    type="button"
                    className={`legal-option ${app.legal.type === "wellness-practitioner" ? "legal-option--active" : ""}`}
                    onClick={() => onUpdate({ ...app, legal: { ...app.legal, type: "wellness-practitioner", hpLicenseNumber: null } })}
                >
                    <span className="legal-option__icon">🌿</span>
                    <span className="legal-option__title">Wellness Facilitator</span>
                    <span className="legal-option__desc">I offer holistic wellness facilitation</span>
                </button>
            </div>

            {app.legal.type === "heilpraktiker" && (
                <div className="input-group" style={{ marginTop: "var(--space-lg)" }}>
                    <label htmlFor="hpLicense">HP License Number *</label>
                    <input
                        id="hpLicense"
                        type="text"
                        placeholder="HP-YYYY-XXX-NNNNN"
                        value={app.legal.hpLicenseNumber || ""}
                        onChange={(e) => onUpdate({ ...app, legal: { ...app.legal, hpLicenseNumber: e.target.value } })}
                    />
                </div>
            )}

            {app.legal.type === "wellness-practitioner" && (
                <div className="disclaimer-box">
                    <p className="disclaimer-box__text">
                        {generateDisclaimerText("wellness-practitioner", "de")}
                    </p>
                    <label className="disclaimer-checkbox">
                        <input
                            type="checkbox"
                            checked={app.legal.disclaimerAccepted}
                            onChange={(e) => onUpdate({ ...app, legal: { ...app.legal, disclaimerAccepted: e.target.checked } })}
                        />
                        <span>Ich bestätige, dass ich kein Heilpraktiker bin und keine medizinischen Leistungen anbiete.</span>
                    </label>
                </div>
            )}
        </div>
    );
}

function SocialStep({ app, onUpdate }: { app: HealerApplication; onUpdate: (a: HealerApplication) => void }) {
    return (
        <div className="onboarding-step">
            <p className="text-muted" style={{ marginBottom: "var(--space-lg)" }}>
                These help seekers find you and build trust. Both are optional.
            </p>
            <div className="input-group">
                <label htmlFor="instagram">Instagram Handle</label>
                <input
                    id="instagram"
                    type="text"
                    placeholder="@yourhandle"
                    value={app.social.instagramHandle || ""}
                    onChange={(e) => onUpdate({ ...app, social: { ...app.social, instagramHandle: e.target.value || null } })}
                />
            </div>
            <div className="input-group">
                <label htmlFor="website">Website URL</label>
                <input
                    id="website"
                    type="text"
                    placeholder="https://yoursite.com"
                    value={app.social.websiteUrl || ""}
                    onChange={(e) => onUpdate({ ...app, social: { ...app.social, websiteUrl: e.target.value || null } })}
                />
            </div>
            <div className="input-group">
                <label htmlFor="meetingUrl">Session Link <span className="text-sm text-muted">(Zoom, Google Meet, or Jitsi)</span></label>
                <input
                    id="meetingUrl"
                    type="text"
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    value={app.social.meetingUrl || ""}
                    onChange={(e) => onUpdate({ ...app, social: { ...app.social, meetingUrl: e.target.value || null } })}
                />
                <p className="text-sm text-muted" style={{ marginTop: "var(--space-xs)" }}>
                    Seekers will receive this link when they book a session with you.
                </p>
            </div>
        </div>
    );
}

function ReviewStep({ app }: { app: HealerApplication }) {
    const completeness = computeCompleteness(app);
    const practitionerType = classifyPractitioner(app);
    const allStepsValid = (["profile", "modalities", "legal"] as OnboardingStep[]).every(
        (s) => validateStep(app, s).valid
    );

    return (
        <div className="onboarding-step">
            <div className="review-summary">
                <div className="review-completeness">
                    <div className="review-completeness__ring" style={{ "--pct": `${completeness}%` } as React.CSSProperties}>
                        <span>{completeness}%</span>
                    </div>
                    <p>Profile Completeness</p>
                </div>
                <div className="review-details">
                    <div className="review-detail"><strong>Name:</strong> {app.profile.fullName || "—"}</div>
                    <div className="review-detail"><strong>Languages:</strong> {app.profile.languages.join(", ") || "—"}</div>
                    <div className="review-detail"><strong>Modalities:</strong> {app.modalities.length > 0 ? app.modalities.map(m => MODALITIES.find(mod => mod.id === m)?.label).join(", ") : "—"}</div>
                    <div className="review-detail"><strong>Credentials:</strong> {app.credentials.length || "None"}</div>
                    <div className="review-detail"><strong>Classification:</strong>{" "}
                        <span className={`badge ${practitionerType === "heilpraktiker" ? "badge--sage" : practitionerType === "wellness-practitioner" ? "badge--terracotta" : "badge--clay"}`}>
                            {practitionerType === "heilpraktiker" ? "🏥 Heilpraktiker" : practitionerType === "wellness-practitioner" ? "🌿 Wellness Facilitator" : "⏳ Unclassified"}
                        </span>
                    </div>
                    {app.social.instagramHandle && <div className="review-detail"><strong>Instagram:</strong> {app.social.instagramHandle}</div>}
                    {app.social.websiteUrl && <div className="review-detail"><strong>Website:</strong> {app.social.websiteUrl}</div>}
                </div>
            </div>
            {allStepsValid ? (
                <div className="review-ready">
                    <span>✨</span> Your application is ready to submit!
                </div>
            ) : (
                <div className="onboarding-warning">
                    Please complete all required steps before submitting.
                </div>
            )}
        </div>
    );
}

const STEP_COMPONENTS: Record<OnboardingStep, React.ComponentType<{ app: HealerApplication; onUpdate: (a: HealerApplication) => void }>> = {
    profile: ProfileStep,
    modalities: ModalitiesStep,
    credentials: CredentialsStep,
    legal: LegalStep,
    social: SocialStep,
    review: ReviewStep as React.ComponentType<{ app: HealerApplication; onUpdate: (a: HealerApplication) => void }>,
};

// ─── Main Page ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const router = useRouter();
    const [stepIndex, setStepIndex] = useState(0);
    const [app, setApp] = useState<HealerApplication>(emptyApplication());
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    // Pre-populate from existing profile
    useEffect(() => {
        fetch("/api/healers/profile")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.fullName) {
                    setApp(prev => ({
                        ...prev,
                        profile: {
                            fullName: data.fullName || prev.profile.fullName,
                            bio: data.bio || prev.profile.bio,
                            languages: data.languages?.length ? data.languages : prev.profile.languages,
                            avatarUrl: data.avatarUrl || prev.profile.avatarUrl,
                        },
                        modalities: data.modalities?.length ? data.modalities : prev.modalities,
                    }));
                }
            })
            .catch(() => { }); // Not signed in yet — that's fine
    }, []);

    const currentStep = ONBOARDING_STEPS[stepIndex];
    const meta = STEP_META[currentStep];
    const StepComponent = STEP_COMPONENTS[currentStep];
    const validation = validateStep(app, currentStep);
    const completeness = computeCompleteness(app);

    const goNext = () => {
        if (stepIndex < ONBOARDING_STEPS.length - 1) setStepIndex(stepIndex + 1);
    };

    const goPrev = () => {
        if (stepIndex > 0) setStepIndex(stepIndex - 1);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setSaveError("");
        try {
            const practitionerType = classifyPractitioner(app);
            const res = await fetch("/api/healers/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: app.profile.fullName,
                    bio: app.profile.bio,
                    languages: app.profile.languages,
                    avatarUrl: app.profile.avatarUrl,
                    modalities: app.modalities,
                    certifications: app.credentials.map(c => `${c.name} (${c.issuer}, ${c.year})`),
                    practitionerType,
                    meetingUrl: app.social.meetingUrl,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save profile");
            }
            setSubmitted(true);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (submitted) {
        return (
            <div className="onboarding-layout">
                <nav className="nav">
                    <Link href="/" className="nav__logo">
                        <span className="nav__logo-icon">🌿</span>
                        HoldSpace
                    </Link>
                </nav>
                <div className="onboarding-success">
                    <div className="onboarding-success__icon">🌿</div>
                    <h2>Welcome to HoldSpace</h2>
                    <p>Your profile is live! Head to your dashboard to manage your practice.</p>
                    <button type="button" className="btn btn--primary" onClick={() => router.push("/dashboard")}>
                        Go to Dashboard →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-layout">
            <nav className="nav">
                <Link href="/" className="nav__logo">
                    <span className="nav__logo-icon">🌿</span>
                    HoldSpace
                </Link>
                <div className="onboarding-progress-label">
                    <span className="text-sm text-muted">Profile completeness</span>
                    <span className="onboarding-progress-pct">{completeness}%</span>
                </div>
            </nav>

            <div className="onboarding-container">
                {/* Step Indicator */}
                <div className="step-indicator">
                    {ONBOARDING_STEPS.map((step, i) => {
                        const stepValidation = validateStep(app, step);
                        const isComplete = stepValidation.valid && i < stepIndex;
                        return (
                            <button
                                key={step}
                                className={`step-indicator__item ${i === stepIndex ? "step-indicator__item--active" : ""} ${isComplete ? "step-indicator__item--complete" : ""}`}
                                onClick={() => setStepIndex(i)}
                                type="button"
                            >
                                <span className="step-indicator__dot">
                                    {isComplete ? "✓" : i + 1}
                                </span>
                                <span className="step-indicator__label">{STEP_META[step].label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div className="onboarding-card animate-in" key={currentStep}>
                    <div className="onboarding-card__header">
                        <span className="onboarding-card__icon">{meta.icon}</span>
                        <div>
                            <h2>{meta.label}</h2>
                            <p className="text-muted">{meta.description}</p>
                        </div>
                    </div>

                    <StepComponent app={app} onUpdate={setApp} />

                    {!validation.valid && validation.errors.length > 0 && currentStep !== "review" && (
                        <div className="onboarding-errors">
                            {validation.errors.map((err, i) => (
                                <div key={i} className="onboarding-error">⚠ {err}</div>
                            ))}
                        </div>
                    )}

                    <div className="onboarding-card__actions">
                        {stepIndex > 0 && (
                            <button type="button" className="btn btn--secondary" onClick={goPrev}>
                                ← Back
                            </button>
                        )}
                        <div style={{ flex: 1 }} />
                        {currentStep === "review" ? (
                            <>
                                {saveError && <div className="onboarding-error" style={{ marginRight: "auto" }}>⚠ {saveError}</div>}
                                <button
                                    type="button"
                                    className="btn btn--primary btn--lg"
                                    onClick={handleSubmit}
                                    disabled={!validateStep(app, "review").valid || saving}
                                >
                                    {saving ? "Saving..." : "Save & Launch Profile ✨"}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={goNext}
                                disabled={!canAdvance(app, currentStep) && currentStep !== "credentials" && currentStep !== "social"}
                            >
                                Continue →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
