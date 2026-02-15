import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 15_000,
    retries: 0,
    reporter: [['list'], ['html', { open: 'never' }]],

    projects: [
        // Existing unit tests — no browser needed
        {
            name: 'unit',
            testMatch: '*.spec.ts',
            testIgnore: 'browser/**',
        },
        // Browser E2E tests — requires dev server
        {
            name: 'browser',
            testDir: './e2e/browser',
            testMatch: '*.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:3099',
            },
        },
    ],

    webServer: {
        command: 'npx next dev --port 3099',
        port: 3099,
        reuseExistingServer: true,
        timeout: 30_000,
    },
});
