/**
 * Program Engine — Pure Functions for Multi-Session Healing Programs
 *
 * All functions are stateless and side-effect-free.
 * Cyclomatic complexity target: ≤ 3 per function.
 */
import type {
    Program,
    ProgramConfig,
    ProgramEnrollment,
    ProgramProgress,
    MilestoneStatus,
    EnrollmentSession,
} from './program-types';

// ─── Program Creation ───────────────────────────────────────────────────────

/**
 * Create a new program from a healer's configuration.
 * Throws if sessionCount doesn't match milestones length.
 */
export function createProgram(healerId: string, config: ProgramConfig): Program {
    if (config.sessionCount !== config.milestones.length) {
        throw new Error(
            `Session count (${config.sessionCount}) must match milestones length (${config.milestones.length}).`,
        );
    }

    return {
        id: `prog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        healerId,
        title: config.title,
        description: config.description,
        modality: config.modality,
        sessionCount: config.sessionCount,
        milestones: config.milestones,
        isPublished: false,
        createdAt: new Date().toISOString(),
    };
}

// ─── Enrollment ─────────────────────────────────────────────────────────────

/**
 * Enroll a seeker in a program. Starts at step 0.
 */
export function enrollSeeker(program: Program, seekerId: string): ProgramEnrollment {
    return {
        id: `enroll-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        programId: program.id,
        seekerId,
        currentStep: 0,
        startedAt: new Date().toISOString(),
        completedAt: null,
        sessions: [],
    };
}

// ─── Advancement ────────────────────────────────────────────────────────────

/**
 * Advance an enrollment by recording a completed session.
 * Throws if the program is already fully completed.
 */
export function advanceEnrollment(
    enrollment: ProgramEnrollment,
    program: Program,
    completedSessionId: string,
): ProgramEnrollment {
    if (enrollment.currentStep >= program.sessionCount) {
        throw new Error('Program already completed. Cannot advance further.');
    }

    const session: EnrollmentSession = {
        sessionId: completedSessionId,
        milestoneIndex: enrollment.currentStep,
        completedAt: new Date().toISOString(),
        preSessionIntention: null,
        postSessionReflection: null,
    };

    const nextStep = enrollment.currentStep + 1;
    const isComplete = nextStep >= program.sessionCount;

    return {
        ...enrollment,
        currentStep: nextStep,
        sessions: [...enrollment.sessions, session],
        completedAt: isComplete ? new Date().toISOString() : null,
    };
}

// ─── Progress Computation ───────────────────────────────────────────────────

/**
 * Compute progress for an enrollment within a program.
 */
export function computeProgress(
    enrollment: ProgramEnrollment,
    program: Program,
): ProgramProgress {
    const totalSteps = program.sessionCount;
    const completedSteps = enrollment.sessions.length;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    const milestones: MilestoneStatus[] = program.milestones.map((milestone, index) => {
        const session = enrollment.sessions.find((s) => s.milestoneIndex === index);
        return {
            milestone,
            completed: !!session,
            sessionId: session?.sessionId ?? null,
        };
    });

    return { percentage, completedSteps, totalSteps, milestones };
}

// ─── Sequential Enforcement ─────────────────────────────────────────────────

/**
 * Check if the next session can be scheduled.
 * Returns false if all sessions are already completed.
 */
export function canScheduleNextSession(
    enrollment: ProgramEnrollment,
    program: Program,
): boolean {
    return enrollment.currentStep < program.sessionCount;
}

// ─── Intention Prompts ──────────────────────────────────────────────────────

/**
 * Generate the intention prompt for a specific milestone.
 * Throws if the milestone index is out of bounds.
 */
export function generateIntentionPrompt(program: Program, milestoneIndex: number): string {
    if (milestoneIndex < 0 || milestoneIndex >= program.milestones.length) {
        throw new Error(
            `Milestone index ${milestoneIndex} is out of bounds (0–${program.milestones.length - 1}).`,
        );
    }

    return program.milestones[milestoneIndex].intentionPrompt;
}
