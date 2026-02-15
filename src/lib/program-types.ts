/**
 * Program Types — HoldSpace Multi-Session Healing Programs
 *
 * Defines structures for healers to offer structured multi-session
 * journeys with milestones, intention prompts, and progress tracking.
 */

// ─── Program Definition ────────────────────────────────────────────────────

export interface ProgramMilestone {
    stepNumber: number;
    title: string;
    description: string;
    intentionPrompt: string;
    integrationPrompt: string;
}

export interface ProgramConfig {
    title: string;
    description: string;
    modality: string;
    sessionCount: number;
    milestones: ProgramMilestone[];
}

export interface Program {
    id: string;
    healerId: string;
    title: string;
    description: string;
    modality: string;
    sessionCount: number;
    milestones: ProgramMilestone[];
    isPublished: boolean;
    createdAt: string;
}

// ─── Enrollment ────────────────────────────────────────────────────────────

export interface EnrollmentSession {
    sessionId: string;
    milestoneIndex: number;
    completedAt: string | null;
    preSessionIntention: string | null;
    postSessionReflection: string | null;
}

export interface ProgramEnrollment {
    id: string;
    programId: string;
    seekerId: string;
    currentStep: number;
    startedAt: string;
    completedAt: string | null;
    sessions: EnrollmentSession[];
}

// ─── Progress ──────────────────────────────────────────────────────────────

export interface MilestoneStatus {
    milestone: ProgramMilestone;
    completed: boolean;
    sessionId: string | null;
}

export interface ProgramProgress {
    percentage: number;
    completedSteps: number;
    totalSteps: number;
    milestones: MilestoneStatus[];
}
