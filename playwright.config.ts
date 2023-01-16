import {PlaywrightTestConfig, devices} from "@playwright/test";

export default {
    projects: [
        {name: "chromium", use: {...devices["Desktop Chrome"]}},
        {name: "firefox", use: {...devices["Desktop Firefox"]}},
        {name: "webkit", use: {...devices["Desktop Safari"]}},
    ],
    testDir: "test",
    fullyParallel: true,
    workers: 16,
    timeout: 60000,
    use: {
        offline: true,
    },
} satisfies PlaywrightTestConfig;
