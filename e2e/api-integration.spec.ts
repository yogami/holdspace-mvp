// HoldSpace — API Integration Tests (Spec-First / TDD)
// These tests validate the API routes against the live Neon database.
// Run: npx playwright test --project=unit api-integration

import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3099";

// ─── GET /api/healers ────────────────────────────────────────────────

test.describe("GET /api/healers", () => {
    test("returns an array of healers from the database", async ({ request }) => {
        const res = await request.get(`${BASE}/api/healers`);
        expect(res.status()).toBe(200);

        const healers = await res.json();
        expect(Array.isArray(healers)).toBe(true);
        expect(healers.length).toBeGreaterThan(0);

        // Each healer must have the expected shape
        const first = healers[0];
        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("fullName");
        expect(first).toHaveProperty("bio");
        expect(first).toHaveProperty("modalities");
        expect(first).toHaveProperty("hourlyRate");
        expect(first).toHaveProperty("availabilityStatus");
        expect(first).toHaveProperty("trustScore");
    });

    test("supports modality filter", async ({ request }) => {
        const res = await request.get(`${BASE}/api/healers?modality=breathwork`);
        expect(res.status()).toBe(200);

        const healers = await res.json();
        for (const h of healers) {
            expect(h.modalities).toContain("breathwork");
        }
    });

    test("supports language filter", async ({ request }) => {
        const res = await request.get(`${BASE}/api/healers?lang=Spanish`);
        expect(res.status()).toBe(200);

        const healers = await res.json();
        for (const h of healers) {
            expect(h.languages).toContain("Spanish");
        }
    });

    test("supports maxPrice filter", async ({ request }) => {
        const res = await request.get(`${BASE}/api/healers?maxPrice=90`);
        expect(res.status()).toBe(200);

        const healers = await res.json();
        for (const h of healers) {
            expect(h.hourlyRate).toBeLessThanOrEqual(90);
        }
    });

    test("supports search query", async ({ request }) => {
        const res = await request.get(`${BASE}/api/healers?q=Aria`);
        expect(res.status()).toBe(200);

        const healers = await res.json();
        expect(healers.length).toBeGreaterThan(0);
        expect(healers.some((h: { fullName: string }) => h.fullName.includes("Aria"))).toBe(true);
    });
});

// ─── POST /api/register ──────────────────────────────────────────────

test.describe("POST /api/register", () => {
    const uniqueEmail = `test-${Date.now()}@holdspace.app`;

    test("creates a new user and healer profile", async ({ request }) => {
        const res = await request.post(`${BASE}/api/register`, {
            data: {
                email: uniqueEmail,
                password: "test-password-123",
                fullName: "Test Healer",
            },
        });
        expect(res.status()).toBe(201);

        const body = await res.json();
        expect(body.userId).toBeTruthy();
        expect(body.message).toBe("Account created");
    });

    test("rejects duplicate email", async ({ request }) => {
        const res = await request.post(`${BASE}/api/register`, {
            data: {
                email: uniqueEmail,
                password: "another-password",
                fullName: "Duplicate",
            },
        });
        expect(res.status()).toBe(409);

        const body = await res.json();
        expect(body.error).toContain("already exists");
    });

    test("rejects missing fields", async ({ request }) => {
        const res = await request.post(`${BASE}/api/register`, {
            data: { email: "incomplete@test.com" },
        });
        expect(res.status()).toBe(400);
    });

    test("rejects short password", async ({ request }) => {
        const res = await request.post(`${BASE}/api/register`, {
            data: {
                email: `short-${Date.now()}@test.com`,
                password: "abc",
                fullName: "Short Pass",
            },
        });
        expect(res.status()).toBe(400);
    });
});

// ─── POST /api/waitlist ──────────────────────────────────────────────

test.describe("POST /api/waitlist", () => {
    const uniqueEmail = `waitlist-${Date.now()}@holdspace.app`;

    test("stores a waitlist email", async ({ request }) => {
        const res = await request.post(`${BASE}/api/waitlist`, {
            data: { email: uniqueEmail },
        });
        expect(res.status()).toBe(200);

        const body = await res.json();
        expect(body.message).toContain("waitlist");
    });

    test("deduplicates repeated submissions", async ({ request }) => {
        // Submit same email again — should succeed silently
        const res = await request.post(`${BASE}/api/waitlist`, {
            data: { email: uniqueEmail },
        });
        expect(res.status()).toBe(200);
    });

    test("rejects invalid email", async ({ request }) => {
        const res = await request.post(`${BASE}/api/waitlist`, {
            data: { email: "not-an-email" },
        });
        expect(res.status()).toBe(400);
    });
});

// ─── PATCH /api/healers/availability ─────────────────────────────────

test.describe("PATCH /api/healers/availability", () => {
    test("requires authentication", async ({ request }) => {
        const res = await request.patch(`${BASE}/api/healers/availability`, {
            data: { status: "online" },
        });
        expect(res.status()).toBe(401);
    });
});

// ─── GET /api/healers/profile ────────────────────────────────────────

test.describe("GET /api/healers/profile", () => {
    test("requires authentication", async ({ request }) => {
        const res = await request.get(`${BASE}/api/healers/profile`);
        expect(res.status()).toBe(401);
    });
});
