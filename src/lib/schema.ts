// HoldSpace — Database Schema (Drizzle ORM + Neon Postgres)
import {
    pgTable,
    text,
    varchar,
    integer,
    boolean,
    real,
    timestamp,
    jsonb,
    uuid,
    pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["healer", "seeker"]);
export const availabilityEnum = pgEnum("availability_status", [
    "online",
    "available_soon",
    "offline",
]);
export const trustTierEnum = pgEnum("trust_tier", [
    "new",
    "verified",
    "established",
    "trusted",
]);
export const practitionerTypeEnum = pgEnum("practitioner_type", [
    "heilpraktiker",
    "wellness-practitioner",
    "unclassified",
]);

// ─── Users (Auth) ────────────────────────────────────────────────────────

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 255 }),
    role: roleEnum("role").notNull().default("healer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Healers (Profile) ──────────────────────────────────────────────────

export const healers = pgTable("healers", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull()
        .unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    bio: text("bio").default(""),
    modalities: jsonb("modalities").$type<string[]>().default([]),
    certifications: jsonb("certifications").$type<string[]>().default([]),
    languages: jsonb("languages").$type<string[]>().default([]),
    hourlyRate: integer("hourly_rate").default(0),
    currency: varchar("currency", { length: 10 }).default("USD"),
    availabilityStatus: availabilityEnum("availability_status").default("offline"),
    isVerified: boolean("is_verified").default(false),
    yearsExperience: integer("years_experience").default(0),
    avgRating: real("avg_rating").default(0),
    totalReviews: integer("total_reviews").default(0),
    totalSessions: integer("total_sessions").default(0),
    // Trust & Safety
    trustScore: integer("trust_score").default(0),
    trustTier: trustTierEnum("trust_tier").default("new"),
    identityVerified: boolean("identity_verified").default(false),
    credentialsVerified: boolean("credentials_verified").default(false),
    backgroundCheck: boolean("background_check").default(false),
    cancellationRate: real("cancellation_rate").default(0),
    responseTimeMinutes: integer("response_time_minutes").default(0),
    practitionerType: practitionerTypeEnum("practitioner_type").default("unclassified"),
    meetingUrl: text("meeting_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Reviews ─────────────────────────────────────────────────────────────

export const reviews = pgTable("reviews", {
    id: uuid("id").defaultRandom().primaryKey(),
    healerId: uuid("healer_id")
        .references(() => healers.id)
        .notNull(),
    seekerName: varchar("seeker_name", { length: 255 }).default("Anonymous"),
    rating: integer("rating").notNull(),
    comment: text("comment").default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Waitlist ────────────────────────────────────────────────────────────

export const waitlist = pgTable("waitlist", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Sessions ────────────────────────────────────────────────────────────

export const sessionStatusEnum = pgEnum("session_status", [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
]);

export const sessions = pgTable("sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    healerId: uuid("healer_id")
        .references(() => healers.id)
        .notNull(),
    seekerName: varchar("seeker_name", { length: 255 }).default("Anonymous Seeker"),
    modality: varchar("modality", { length: 100 }),
    duration: integer("duration").default(60),
    scheduledDate: timestamp("scheduled_date"),
    scheduledTime: varchar("scheduled_time", { length: 10 }),
    status: sessionStatusEnum("status").default("pending"),
    rating: integer("rating"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Safety Reports ──────────────────────────────────────────────────────

export const reportCategoryEnum = pgEnum("report_category", [
    "inappropriate",
    "harassment",
    "no_show",
    "misrepresentation",
    "safety_concern",
]);

export const safetyReports = pgTable("safety_reports", {
    id: uuid("id").defaultRandom().primaryKey(),
    healerId: uuid("healer_id")
        .references(() => healers.id)
        .notNull(),
    category: reportCategoryEnum("category").notNull(),
    description: text("description").default(""),
    reporterName: varchar("reporter_name", { length: 255 }).default("Anonymous"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
