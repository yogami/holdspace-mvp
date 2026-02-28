"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { MODALITIES, LANGUAGES, type Modality, type Healer } from "@/lib/constants";
import { TrustBadge } from "@/components/trust-badge";

interface NearbyInfo {
    distanceMeters: number;
    distanceLabel: string;
}

function haversine(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6_371_000;
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(m: number): string {
    return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

const HEALER_LOCATIONS: Record<string, { lat: number; lng: number }> = {
    "h-aria-moon": { lat: 52.52, lng: 13.405 },
    "h-kai-tanaka": { lat: 52.4912, lng: 13.3902 },
    "h-luna-rivers": { lat: 52.5307, lng: 13.3847 },
    "h-james-okonkwo": { lat: 52.5163, lng: 13.3777 },
    "h-maya-osei": { lat: 52.5069, lng: 13.4228 },
    "h-sam-chen": { lat: 52.4869, lng: 13.426 },
};

export default function HealerGrid({ initialHealers }: { initialHealers: Healer[] }) {
    const [search, setSearch] = useState("");
    const [selectedModalities, setSelectedModalities] = useState<Modality[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [maxPrice, setMaxPrice] = useState(200);
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [showNearMe, setShowNearMe] = useState(false);
    const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [nearbyMap, setNearbyMap] = useState<Record<string, NearbyInfo>>({});
    const [locationError, setLocationError] = useState<string | null>(null);

    const handleNearMeToggle = useCallback(() => {
        if (showNearMe) {
            setShowNearMe(false);
            setMyPosition(null);
            setNearbyMap({});
            setLocationError(null);
            return;
        }

        if (!navigator.geolocation) {
            setLocationError("Geolocation not available");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setMyPosition(me);
                setShowNearMe(true);
                setLocationError(null);

                const nearby: Record<string, NearbyInfo> = {};
                for (const [id, loc] of Object.entries(HEALER_LOCATIONS)) {
                    const d = haversine(me, loc);
                    if (d <= 10_000) {
                        nearby[id] = { distanceMeters: d, distanceLabel: fmtDist(d) };
                    }
                }
                setNearbyMap(nearby);
            },
            (err) => {
                setLocationError(err.message || "Location access denied");
            },
            { enableHighAccuracy: true, timeout: 10_000 },
        );
    }, [showNearMe]);

    const toggleModality = (id: Modality) => {
        setSelectedModalities(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const filteredHealers = useMemo(() => {
        let result = [...initialHealers];

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(h =>
                h.fullName.toLowerCase().includes(q) ||
                h.bio.toLowerCase().includes(q)
            );
        }

        if (selectedModalities.length > 0) {
            result = result.filter(h =>
                selectedModalities.some(m => h.modalities.includes(m))
            );
        }

        if (selectedLanguage) {
            result = result.filter(h => h.languages.includes(selectedLanguage));
        }

        result = result.filter(h => h.hourlyRate <= maxPrice);

        if (showOnlineOnly) {
            result = result.filter(h => h.availabilityStatus === "online");
        }

        const statusOrder = { online: 0, available_soon: 1, offline: 2 };
        result.sort((a, b) => statusOrder[a.availabilityStatus] - statusOrder[b.availabilityStatus]);

        if (showNearMe && myPosition) {
            result.sort((a, b) => {
                const da = nearbyMap[a.id]?.distanceMeters ?? Infinity;
                const db = nearbyMap[b.id]?.distanceMeters ?? Infinity;
                return da - db;
            });
        }

        return result;
    }, [search, selectedModalities, selectedLanguage, maxPrice, showOnlineOnly, showNearMe, myPosition, nearbyMap, initialHealers]);

    return (
        <>
            {/* Filter Bar */}
            <div className="filter-bar animate-in animate-in-delay-1" style={{ border: "none", background: "var(--warm-white)", padding: "var(--space-xl)" }}>
                <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                    <label className="text-sm" style={{ fontWeight: 600, color: "var(--charcoal)" }}>What are you looking for support with?</label>
                    <input
                        type="search"
                        placeholder="e.g., anxiety, grief, grounding..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ background: "white" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", flex: 1.5 }}>
                    <label className="text-sm" style={{ fontWeight: 600, color: "var(--charcoal)" }}>Preferred approach</label>
                    <div className="filter-pills">
                        {MODALITIES.map(mod => (
                            <button
                                key={mod.id}
                                className={`filter-pill ${selectedModalities.includes(mod.id) ? "filter-pill--active" : ""}`}
                                onClick={() => toggleModality(mod.id)}
                            >
                                {mod.icon} {mod.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap", alignItems: "end" }}>
                    <div className="input-group" style={{ minWidth: 140 }}>
                        <label>Language</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            <option value="">All languages</option>
                            {LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group" style={{ minWidth: 160 }}>
                        <label className="text-sm" style={{ fontWeight: 600, color: "var(--charcoal)" }}>Max exchange: ${maxPrice}/hr</label>
                        <input
                            type="range"
                            min={30}
                            max={200}
                            step={5}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            style={{ padding: "8px 0" }}
                        />
                    </div>

                    <button
                        className={`filter-pill ${showOnlineOnly ? "filter-pill--active" : ""}`}
                        onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                        style={{ height: "fit-content" }}
                    >
                        🟢 Online now
                    </button>

                    <button
                        className={`filter-pill ${showNearMe ? "filter-pill--active" : ""}`}
                        onClick={handleNearMeToggle}
                        style={{ height: "fit-content" }}
                    >
                        📍 Near me
                    </button>
                </div>
            </div>

            {locationError && (
                <p className="text-sm" style={{ color: "var(--terracotta)", marginBottom: "var(--space-md)" }}>
                    📍 {locationError}
                </p>
            )}

            <p className="text-sm text-muted animate-in animate-in-delay-2" style={{ marginBottom: "var(--space-lg)" }}>
                {filteredHealers.length} healer{filteredHealers.length !== 1 ? "s" : ""} found
                {showNearMe && myPosition && " — sorted by distance"}
            </p>

            <div className="healer-grid">
                {filteredHealers.map(healer => (
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
                                    <div className="healer-card__name">
                                        {healer.fullName}
                                    </div>
                                    <TrustBadge
                                        tier={healer.trustTier}
                                        score={healer.trustScore}
                                        identityVerified={healer.identityVerified}
                                        credentialsVerified={healer.credentialsVerified}
                                        backgroundCheck={healer.backgroundCheck}
                                        compact
                                    />
                                    <div className="healer-card__modalities">
                                        {healer.modalities.map(m => {
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
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "var(--space-sm) 0" }}>
                                {healer.languages.map(lang => (
                                    <span key={lang} className="badge badge--clay">{lang}</span>
                                ))}
                            </div>
                            <div className="healer-card__footer">
                                <div className="rating-summary">
                                    <span className="stars">★</span>
                                    <span className="rating-number">{healer.avgRating}</span>
                                    <span className="text-sm text-muted">({healer.totalReviews} reviews)</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                                    {showNearMe && nearbyMap[healer.id] && (
                                        <span className="badge badge--sage" style={{ fontSize: "0.75rem" }}>
                                            📍 {nearbyMap[healer.id].distanceLabel}
                                        </span>
                                    )}
                                    <div className="healer-card__price">
                                        ${healer.hourlyRate}<span>/hr</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredHealers.length === 0 && (
                <div style={{ textAlign: "center", padding: "var(--space-3xl) 0" }}>
                    <p style={{ fontSize: "1.5rem", marginBottom: "var(--space-md)" }}>🌿</p>
                    <h3>No healers match your filters</h3>
                    <p>Try adjusting your search or broadening your modality selection.</p>
                </div>
            )}
        </>
    );
}
