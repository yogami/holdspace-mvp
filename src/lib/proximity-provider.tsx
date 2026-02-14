/**
 * HoldSpace — Proximity Provider
 *
 * React context wrapping @platform/proximity's ProximityService
 * for real-time healer proximity detection.
 *
 * Usage:
 *   <ProximityProvider>
 *     <HealerBrowsePage />
 *   </ProximityProvider>
 *
 *   // In any child component:
 *   const { nearbyHealers, myPosition, isTracking } = useProximity();
 */

'use client';

import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';

// ─── Types (mirroring @platform/proximity for standalone MVP) ──────────────

interface GeoPoint {
    lat: number;
    lng: number;
}

interface NearbyHealer {
    healerId: string;
    distanceMeters: number;
    distanceLabel: string;
    detectedVia: 'gps' | 'ble' | 'manual';
    lastSeen: Date;
}

interface ProximityState {
    /** Whether proximity tracking is active */
    isTracking: boolean;
    /** Whether the user has granted location consent */
    hasConsent: boolean;
    /** Current user position */
    myPosition: GeoPoint | null;
    /** Healers detected nearby, sorted by distance */
    nearbyHealers: NearbyHealer[];
    /** Error message if tracking failed */
    error: string | null;
}

interface ProximityContextValue extends ProximityState {
    /** Request location consent and start tracking */
    startTracking: () => void;
    /** Stop tracking and revoke consent */
    stopTracking: () => void;
    /** Get distance to a specific healer */
    getDistanceTo: (healerId: string) => NearbyHealer | undefined;
}

// ─── Haversine (inlined to avoid monorepo dependency in MVP) ───────────────

function toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
}

function haversineDistance(from: GeoPoint, to: GeoPoint): number {
    const R = 6_371_000;
    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
}

// ─── Simulated healer positions (MVP seed data with coordinates) ───────────

const HEALER_POSITIONS: Record<string, GeoPoint> = {
    'h-aria-moon': { lat: 52.5200, lng: 13.4050 },    // Berlin Mitte
    'h-kai-tanaka': { lat: 52.4912, lng: 13.3902 },   // Kreuzberg
    'h-luna-rivers': { lat: 52.5307, lng: 13.3847 },   // Prenzlauer Berg
    'h-james-okonkwo': { lat: 52.5163, lng: 13.3777 }, // Tiergarten
    'h-maya-osei': { lat: 52.5069, lng: 13.4228 },     // Friedrichshain
    'h-sam-chen': { lat: 52.4869, lng: 13.4260 },      // Neukölln
};

// ─── Context ────────────────────────────────────────────────────────────────

const ProximityContext = createContext<ProximityContextValue | null>(null);

export function ProximityProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ProximityState>({
        isTracking: false,
        hasConsent: false,
        myPosition: null,
        nearbyHealers: [],
        error: null,
    });

    const watchIdRef = useRef<number | null>(null);

    const calculateNearby = useCallback((position: GeoPoint) => {
        const nearby: NearbyHealer[] = Object.entries(HEALER_POSITIONS)
            .map(([healerId, healerPos]) => {
                const dist = haversineDistance(position, healerPos);
                return {
                    healerId,
                    distanceMeters: dist,
                    distanceLabel: formatDistance(dist),
                    detectedVia: 'gps' as const,
                    lastSeen: new Date(),
                };
            })
            .filter((h) => h.distanceMeters <= 10_000) // 10km max range
            .sort((a, b) => a.distanceMeters - b.distanceMeters);

        return nearby;
    }, []);

    const startTracking = useCallback(() => {
        if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
            setState((s) => ({ ...s, error: 'Geolocation not available' }));
            return;
        }

        setState((s) => ({ ...s, hasConsent: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const point: GeoPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                const nearby = calculateNearby(point);
                setState((s) => ({
                    ...s,
                    isTracking: true,
                    myPosition: point,
                    nearbyHealers: nearby,
                }));
            },
            (err) => {
                setState((s) => ({
                    ...s,
                    error: err.message || 'Location access denied',
                    isTracking: false,
                }));
            },
            { enableHighAccuracy: true, timeout: 10_000 },
        );

        // Start continuous watching
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const point: GeoPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                const nearby = calculateNearby(point);
                setState((s) => ({
                    ...s,
                    isTracking: true,
                    myPosition: point,
                    nearbyHealers: nearby,
                }));
            },
            (err) => {
                setState((s) => ({ ...s, error: err.message }));
            },
            { enableHighAccuracy: true, maximumAge: 10_000 },
        );
    }, [calculateNearby]);

    const stopTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setState({
            isTracking: false,
            hasConsent: false,
            myPosition: null,
            nearbyHealers: [],
            error: null,
        });
    }, []);

    const getDistanceTo = useCallback(
        (healerId: string) => state.nearbyHealers.find((h) => h.healerId === healerId),
        [state.nearbyHealers],
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return (
        <ProximityContext.Provider
            value={{ ...state, startTracking, stopTracking, getDistanceTo }}
        >
            {children}
        </ProximityContext.Provider>
    );
}

/**
 * Hook to access proximity data in any child component.
 */
export function useProximity(): ProximityContextValue {
    const ctx = useContext(ProximityContext);
    if (!ctx) {
        throw new Error('useProximity must be used within a <ProximityProvider>');
    }
    return ctx;
}
