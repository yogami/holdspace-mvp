const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROUTES = [
    { url: '/', name: 'slide_1_home.png', waitFor: '.hero' },
    { url: '/healers/h-aria-moon', name: 'slide_2_leakage_healers.png', waitFor: '.profile-hero' },
    { url: '/dashboard', name: 'slide_3_saas_tools.png', waitFor: '.dashboard-stat-card' },
    { url: '/session/h-aria-moon/safety-report', name: 'slide_4_moat_compliance.png', waitFor: 'form' },
    { url: '/session/h-aria-moon/review', name: 'slide_5_ai_safety.png', waitFor: '.star-select' },
    { url: '/healers', name: 'slide_6_b2c_market.png', waitFor: '.healer-card' },
    { url: '/onboarding', name: 'slide_7_revenue.png', waitFor: '.onboarding-layout' },
    { url: '/healers?location=Berlin', name: 'slide_8_gtm_berlin.png', waitFor: '.healer-card' },
    { url: '/register/seeker', name: 'slide_9_mvp_traction.png', waitFor: '.auth-card' },
    { url: '/', name: 'slide_10_the_ask.png', waitFor: '.hero' }
];

async function run() {
    const outDir = '/tmp/screenshots';
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    console.log("Starting browser...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 430, height: 932 } // iPhone 14 Pro size (9:16 approx)
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
        let fullUrl = 'http://localhost:3099' + route.url;
        console.log("Navigating to " + fullUrl);
        try {
            await page.goto(fullUrl, { waitUntil: 'load', timeout: 60000 });
            console.log("Waiting for element: " + route.waitFor);
            await page.waitForSelector(route.waitFor, { timeout: 15000 });
            console.log("Element found, page rendered properly.");
        } catch (e) {
            console.log("Error loading page or finding element: " + e.message);
        }

        // Wait an extra second for animations to settle
        await page.waitForTimeout(1000);

        const outPath = path.join(outDir, route.name);
        await page.screenshot({ path: outPath });
        console.log("Saved " + outPath);
    }

    await browser.close();
    console.log("Done");
}

run();
