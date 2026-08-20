import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

export default defineConfig({
    testDir: './e2e',

    fullyParallel: false,

    forbidOnly: !!process.env.CI,

    retries: process.env.CI ? 2 : 0,

    workers: process.env.CI ? 1 : undefined,

    reporter: 'html',

    use: {
        baseURL: 'http://127.0.0.1:3000',

        trace: 'on-first-retry',

        screenshot: 'only-on-failure',

        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'setup',

            testMatch: /.*\.setup\.ts/,
        },

        {
            name: 'chromium',

            use: {
                ...devices['Desktop Chrome'],

                storageState: authFile,
            },

            dependencies: ['setup'],

            testIgnore: /.*\.setup\.ts/,
        },
    ],

    webServer: {
        command: 'npm run build:e2e && npm run start',

        url: 'http://127.0.0.1:3000',

        reuseExistingServer: false,

        timeout: 180_000,
    },
});
