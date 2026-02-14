// HoldSpace — Shared Constants

export const MODALITIES = [
    { id: "breathwork", label: "Breathwork", icon: "🌬️", description: "Guided breathing for calm and release" },
    { id: "energy-healing", label: "Energy Healing", icon: "✨", description: "Reiki, pranic, and subtle body work" },
    { id: "somatic", label: "Somatic Work", icon: "🧘", description: "Body-based trauma release" },
    { id: "grief-holding", label: "Grief Holding", icon: "🤲", description: "Compassionate space for loss" },
    { id: "sound-healing", label: "Sound Healing", icon: "🎵", description: "Singing bowls, tones, and vibration" },
    { id: "meditation", label: "Meditation", icon: "🪷", description: "Guided presence and stillness" },
    { id: "nervous-system", label: "Nervous System", icon: "🌊", description: "Vagal toning and co-regulation" },
    { id: "emotional-release", label: "Emotional Release", icon: "💧", description: "Safe space for big feelings" },
] as const;

export const LANGUAGES = [
    "English",
    "Spanish",
    "German",
    "French",
    "Portuguese",
    "Hindi",
    "Japanese",
    "Korean",
    "Arabic",
    "Mandarin",
] as const;

export const DURATION_OPTIONS = [
    { minutes: 30, label: "30 minutes" },
    { minutes: 60, label: "1 hour" },
    { minutes: 90, label: "90 minutes" },
] as const;

export const AVAILABILITY_LABELS = {
    online: "Available now",
    available_soon: "Available soon",
    offline: "Offline",
} as const;

export type AvailabilityStatus = "online" | "available_soon" | "offline";
export type Modality = (typeof MODALITIES)[number]["id"];

export interface Healer {
    id: string;
    fullName: string;
    avatarUrl: string;
    bio: string;
    modalities: Modality[];
    certifications: string[];
    languages: string[];
    hourlyRate: number; // in dollars
    currency: string;
    availabilityStatus: AvailabilityStatus;
    isVerified: boolean;
    yearsExperience: number;
    avgRating: number;
    totalReviews: number;
    totalSessions: number;
    // Trust & Safety extensions
    trustScore: number;              // 0–100 composite
    trustTier: 'new' | 'verified' | 'established' | 'trusted';
    identityVerified: boolean;
    credentialsVerified: boolean;
    backgroundCheck: boolean;
    cancellationRate: number;        // 0–1
    responseTimeMinutes: number;
    accountCreatedAt: string;        // ISO date
    activeSessionId: string | null;  // null = available
    lastLocationUpdate: string | null;
}

export interface Review {
    id: string;
    seekerName: string;
    rating: number;
    comment: string;
    createdAt: string;
}
