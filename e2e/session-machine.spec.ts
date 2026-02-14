/**
 * Session State Machine — TDD Specs (written BEFORE implementation)
 *
 * Tests state transitions, auto-availability toggle, SOS handling,
 * confirmation timeout, and edge cases.
 */

import { test, expect } from '@playwright/test';
import {
    createSession,
    transitionSession,
    triggerSOS,
    getHealerAvailability,
} from '../src/lib/session-machine';
import type { Session, SessionStatus, SOSEvent } from '../src/lib/trust-types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. SESSION CREATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('createSession', () => {
    test('creates a session with pending status', () => {
        const session = createSession('healer-1', 'seeker-1', 60);
        expect(session.status).toBe('pending');
        expect(session.healerId).toBe('healer-1');
        expect(session.seekerId).toBe('seeker-1');
        expect(session.durationMinutes).toBe(60);
        expect(session.id).toBeDefined();
        expect(session.scheduledAt).toBeDefined();
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. STATE TRANSITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('transitionSession', () => {
    test('pending → confirmed', () => {
        const session = createSession('h1', 's1', 60);
        const updated = transitionSession(session, 'confirmed');
        expect(updated.status).toBe('confirmed');
    });

    test('confirmed → active (sets startedAt)', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        const active = transitionSession(session, 'active');
        expect(active.status).toBe('active');
        expect(active.startedAt).toBeDefined();
    });

    test('active → completed (sets endedAt)', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        session = transitionSession(session, 'active');
        const completed = transitionSession(session, 'completed');
        expect(completed.status).toBe('completed');
        expect(completed.endedAt).toBeDefined();
    });

    test('pending → cancelled (with reason)', () => {
        const session = createSession('h1', 's1', 60);
        const cancelled = transitionSession(session, 'cancelled', {
            cancelledBy: 'seeker',
            cancellationReason: 'Changed my mind',
        });
        expect(cancelled.status).toBe('cancelled');
        expect(cancelled.cancelledBy).toBe('seeker');
        expect(cancelled.cancellationReason).toBe('Changed my mind');
    });

    test('completed session CANNOT transition further', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        session = transitionSession(session, 'active');
        session = transitionSession(session, 'completed');

        expect(() => transitionSession(session, 'active')).toThrow();
    });

    test('cancelled session CANNOT transition further', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'cancelled');

        expect(() => transitionSession(session, 'confirmed')).toThrow();
    });

    test('cannot skip states (pending → active is invalid)', () => {
        const session = createSession('h1', 's1', 60);
        expect(() => transitionSession(session, 'active')).toThrow();
    });

    test('active → reported is valid (SOS/safety path)', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        session = transitionSession(session, 'active');
        const reported = transitionSession(session, 'reported');
        expect(reported.status).toBe('reported');
        expect(reported.endedAt).toBeDefined();
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. SOS HANDLING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('triggerSOS', () => {
    test('SOS on active session → force-ends and attaches SOSEvent', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        session = transitionSession(session, 'active');

        const result = triggerSOS(session, 'seeker');
        expect(result.status).toBe('reported');
        expect(result.endedAt).toBeDefined();
        expect(result.sosEvent).toBeDefined();
        expect(result.sosEvent!.triggeredBy).toBe('seeker');
        expect(result.sosEvent!.sessionId).toBe(session.id);
    });

    test('SOS on non-active session throws', () => {
        const session = createSession('h1', 's1', 60);
        expect(() => triggerSOS(session, 'seeker')).toThrow();
    });

    test('SOS captures location if provided', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        session = transitionSession(session, 'active');

        const result = triggerSOS(session, 'healer', { lat: 52.52, lng: 13.405 });
        expect(result.sosEvent!.locationSnapshot).toEqual({ lat: 52.52, lng: 13.405 });
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. HEALER AVAILABILITY (auto-toggle)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('getHealerAvailability', () => {
    test('no sessions → online', () => {
        const status = getHealerAvailability([]);
        expect(status).toBe('online');
    });

    test('active session → busy', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        session = transitionSession(session, 'active');

        const status = getHealerAvailability([session]);
        expect(status).toBe('busy');
    });

    test('pending session → online (still available)', () => {
        const session = createSession('h1', 's1', 60);
        const status = getHealerAvailability([session]);
        expect(status).toBe('online');
    });

    test('only completed sessions → online', () => {
        let session = createSession('h1', 's1', 60);
        session = transitionSession(session, 'confirmed');
        session = transitionSession(session, 'active');
        session = transitionSession(session, 'completed');

        const status = getHealerAvailability([session]);
        expect(status).toBe('online');
    });

    test('multiple sessions, one active → busy', () => {
        let s1 = createSession('h1', 's1', 60);
        s1 = transitionSession(s1, 'confirmed');
        s1 = transitionSession(s1, 'active');
        s1 = transitionSession(s1, 'completed');

        let s2 = createSession('h1', 's2', 30);
        s2 = transitionSession(s2, 'confirmed');
        s2 = transitionSession(s2, 'active');

        const status = getHealerAvailability([s1, s2]);
        expect(status).toBe('busy');
    });
});
