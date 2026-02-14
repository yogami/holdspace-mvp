// HoldSpace — Session State Machine
//
// State machine for session lifecycle management.
// Automatically manages healer availability based on session state.
// All functions are pure and stateless for testability.

import type { Session, SessionStatus, SOSEvent } from './trust-types';

// ─── Valid Transitions ──────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['active', 'cancelled'],
    active: ['completed', 'cancelled', 'reported'],
    completed: [],      // terminal state
    cancelled: [],      // terminal state
    reported: [],        // terminal state
};

// ─── Session Creation ───────────────────────────────────────────────────────

/**
 * Create a new session in pending state.
 */
export function createSession(
    healerId: string,
    seekerId: string,
    durationMinutes: number,
): Session {
    return {
        id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        healerId,
        seekerId,
        status: 'pending',
        scheduledAt: new Date().toISOString(),
        durationMinutes,
    };
}

// ─── State Transitions ──────────────────────────────────────────────────────

interface TransitionOptions {
    cancelledBy?: 'healer' | 'seeker' | 'system';
    cancellationReason?: string;
}

/**
 * Transition a session to a new state.
 * Throws if the transition is invalid.
 */
export function transitionSession(
    session: Session,
    targetStatus: SessionStatus,
    options?: TransitionOptions,
): Session {
    const allowed = VALID_TRANSITIONS[session.status];

    if (!allowed.includes(targetStatus)) {
        throw new Error(
            `Invalid transition: ${session.status} → ${targetStatus}. ` +
            `Allowed: [${allowed.join(', ')}]`,
        );
    }

    const now = new Date().toISOString();
    const updated: Session = { ...session, status: targetStatus };

    // Attach timestamps based on target state
    if (targetStatus === 'active') {
        updated.startedAt = now;
    }

    if (targetStatus === 'completed' || targetStatus === 'reported') {
        updated.endedAt = now;
    }

    if (targetStatus === 'cancelled' && options) {
        updated.cancelledBy = options.cancelledBy;
        updated.cancellationReason = options.cancellationReason;
    }

    return updated;
}

// ─── SOS Handling ───────────────────────────────────────────────────────────

/**
 * Trigger SOS on an active session.
 * Force-ends the session and attaches an SOS event.
 * Throws if session is not active.
 */
export function triggerSOS(
    session: Session,
    triggeredBy: 'healer' | 'seeker',
    locationSnapshot?: { lat: number; lng: number },
): Session {
    if (session.status !== 'active') {
        throw new Error(`Cannot trigger SOS on a ${session.status} session. Session must be active.`);
    }

    const now = new Date().toISOString();

    const sosEvent: SOSEvent = {
        sessionId: session.id,
        triggeredBy,
        timestamp: now,
        locationSnapshot,
    };

    return {
        ...session,
        status: 'reported',
        endedAt: now,
        sosEvent,
    };
}

// ─── Healer Availability ────────────────────────────────────────────────────

export type HealerAvailability = 'online' | 'busy' | 'offline';

/**
 * Determine healer availability based on their sessions.
 * If ANY session is active → busy.
 * Otherwise → online.
 */
export function getHealerAvailability(sessions: Session[]): HealerAvailability {
    const hasActive = sessions.some((s) => s.status === 'active');
    return hasActive ? 'busy' : 'online';
}
