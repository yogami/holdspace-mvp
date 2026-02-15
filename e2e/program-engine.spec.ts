/**
 * Program Engine — TDD Specs (written BEFORE implementation)
 *
 * Tests program creation, enrollment lifecycle, progress computation,
 * sequential enforcement, and intention/reflection prompt generation.
 */
import { test, expect } from '@playwright/test';
import {
    createProgram,
    enrollSeeker,
    advanceEnrollment,
    computeProgress,
    canScheduleNextSession,
    generateIntentionPrompt,
} from '../src/lib/program-engine';
import type {
    Program,
    ProgramConfig,
    ProgramEnrollment,
    ProgramMilestone,
} from '../src/lib/program-types';

// ─── Fixtures ────────────────────────────────────────────────────────────

function makeBreathworkMilestones(): ProgramMilestone[] {
    return [
        {
            stepNumber: 1,
            title: 'Grounding & Awareness',
            description: 'Establish a baseline connection with breath.',
            intentionPrompt: 'What does safety feel like in your body right now?',
            integrationPrompt: 'What did you notice during the breathing exercises?',
        },
        {
            stepNumber: 2,
            title: 'Deepening the Practice',
            description: 'Expand breath capacity and emotional release.',
            intentionPrompt: 'What are you ready to let go of today?',
            integrationPrompt: 'What emotions surfaced during the session?',
        },
        {
            stepNumber: 3,
            title: 'Integration & Embodiment',
            description: 'Anchor the practice into daily life.',
            intentionPrompt: 'How will you carry this practice into your week?',
            integrationPrompt: 'What has shifted for you across this journey?',
        },
    ];
}

function make3SessionConfig(): ProgramConfig {
    return {
        title: 'Breathwork Foundations',
        description: 'A 3-session journey into conscious breathing.',
        modality: 'breathwork',
        sessionCount: 3,
        milestones: makeBreathworkMilestones(),
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. PROGRAM CREATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('createProgram', () => {
    test('creates a program with correct properties', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        expect(program.id).toBeDefined();
        expect(program.healerId).toBe('healer-1');
        expect(program.title).toBe('Breathwork Foundations');
        expect(program.sessionCount).toBe(3);
        expect(program.milestones).toHaveLength(3);
        expect(program.isPublished).toBe(false);
        expect(program.createdAt).toBeDefined();
    });

    test('milestones retain step numbers and prompts', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        expect(program.milestones[0].stepNumber).toBe(1);
        expect(program.milestones[0].intentionPrompt).toContain('safety');
        expect(program.milestones[2].stepNumber).toBe(3);
    });

    test('sessionCount must match milestones length', () => {
        const config = make3SessionConfig();
        config.sessionCount = 5; // mismatch
        expect(() => createProgram('healer-1', config)).toThrow();
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. ENROLLMENT LIFECYCLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('enrollSeeker', () => {
    test('creates an enrollment at step 0', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        const enrollment = enrollSeeker(program, 'seeker-1');
        expect(enrollment.id).toBeDefined();
        expect(enrollment.programId).toBe(program.id);
        expect(enrollment.seekerId).toBe('seeker-1');
        expect(enrollment.currentStep).toBe(0);
        expect(enrollment.sessions).toHaveLength(0);
        expect(enrollment.completedAt).toBeNull();
    });
});

test.describe('advanceEnrollment', () => {
    test('completing session 1 advances to step 1', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        const enrollment = enrollSeeker(program, 'seeker-1');
        const updated = advanceEnrollment(enrollment, program, 'sess-100');
        expect(updated.currentStep).toBe(1);
        expect(updated.sessions).toHaveLength(1);
        expect(updated.sessions[0].sessionId).toBe('sess-100');
        expect(updated.sessions[0].milestoneIndex).toBe(0);
        expect(updated.sessions[0].completedAt).toBeDefined();
    });

    test('completing all sessions marks enrollment as completed', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-2');
        enrollment = advanceEnrollment(enrollment, program, 'sess-3');
        expect(enrollment.currentStep).toBe(3);
        expect(enrollment.completedAt).toBeDefined();
        expect(enrollment.sessions).toHaveLength(3);
    });

    test('cannot advance beyond program length', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-2');
        enrollment = advanceEnrollment(enrollment, program, 'sess-3');
        expect(() => advanceEnrollment(enrollment, program, 'sess-4')).toThrow();
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. PROGRESS COMPUTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('computeProgress', () => {
    test('0 sessions = 0%', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        const enrollment = enrollSeeker(program, 'seeker-1');
        const progress = computeProgress(enrollment, program);
        expect(progress.percentage).toBe(0);
        expect(progress.completedSteps).toBe(0);
        expect(progress.totalSteps).toBe(3);
    });

    test('1 of 3 sessions = 33%', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        const progress = computeProgress(enrollment, program);
        expect(progress.percentage).toBe(33);
        expect(progress.completedSteps).toBe(1);
    });

    test('2 of 3 sessions = 67%', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-2');
        const progress = computeProgress(enrollment, program);
        expect(progress.percentage).toBe(67);
        expect(progress.completedSteps).toBe(2);
    });

    test('3 of 3 sessions = 100%', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-2');
        enrollment = advanceEnrollment(enrollment, program, 'sess-3');
        const progress = computeProgress(enrollment, program);
        expect(progress.percentage).toBe(100);
        expect(progress.completedSteps).toBe(3);
    });

    test('milestone statuses reflect completion', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        const progress = computeProgress(enrollment, program);
        expect(progress.milestones[0].completed).toBe(true);
        expect(progress.milestones[0].sessionId).toBe('sess-1');
        expect(progress.milestones[1].completed).toBe(false);
        expect(progress.milestones[1].sessionId).toBeNull();
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. SEQUENTIAL ENFORCEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('canScheduleNextSession', () => {
    test('fresh enrollment → can schedule', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        const enrollment = enrollSeeker(program, 'seeker-1');
        expect(canScheduleNextSession(enrollment, program)).toBe(true);
    });

    test('after completing a session → can schedule next', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        expect(canScheduleNextSession(enrollment, program)).toBe(true);
    });

    test('all sessions completed → cannot schedule more', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        let enrollment = enrollSeeker(program, 'seeker-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-1');
        enrollment = advanceEnrollment(enrollment, program, 'sess-2');
        enrollment = advanceEnrollment(enrollment, program, 'sess-3');
        expect(canScheduleNextSession(enrollment, program)).toBe(false);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. INTENTION PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('generateIntentionPrompt', () => {
    test('returns intention prompt for the given milestone', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        const prompt = generateIntentionPrompt(program, 0);
        expect(prompt).toContain('safety');
    });

    test('returns integration prompt for later milestone', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        const prompt = generateIntentionPrompt(program, 2);
        expect(prompt).toContain('carry this practice');
    });

    test('out-of-bounds milestone index throws', () => {
        const program = createProgram('healer-1', make3SessionConfig());
        expect(() => generateIntentionPrompt(program, 5)).toThrow();
    });
});
