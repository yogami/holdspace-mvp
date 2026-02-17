// HoldSpace — Database Client (Drizzle + Neon Serverless)
// Lazy-initialised so Next.js can collect page data at build time
// without requiring DATABASE_URL (which is only available at runtime).
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
    if (!_db) {
        const sql = neon(process.env.DATABASE_URL!);
        _db = drizzle(sql, { schema });
    }
    return _db;
}

// Keep default export for backward compatibility — works at runtime
// but will throw at build-time page collection (which is OK because
// Next.js only collects static pages, not API routes at build).
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
    get(_target, prop) {
        return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
    },
});
