const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * The combined QA lab VM hosts two independent demo apps on one host:
 *   FinServe Retail Demo   -> :8082
 *   Insurance Order Entry  -> :8081
 * FINSERVE_BASE_URL / INSURANCE_BASE_URL should be set per the Combined QA Lab Learner Guide,
 * e.g. FINSERVE_BASE_URL=http://<your-lab-vm-ip>:8082
 * This suite currently targets FinServe; the insurance-* project is a placeholder for when
 * Insurance Order Entry tests are added under tests/insurance-order-entry/.
 *
 * SERIAL EXECUTION — required, not optional, on this shared lab:
 * The 2026-08-17 run (fullyParallel: true, default local workers = CPU core count) produced
 * 14 distinct failing tests across 20 browser-project executions. 13 of those 14 showed an
 * identical "500 Server Error" page/response from the backend at 34.93.84.32:8082 — the
 * shared lab VM could not keep up with 4 browser projects hitting it concurrently. Only one
 * failure (the DEF-FS-001 defect-reproduction test) was unrelated to the 500s and is an
 * intentional, expected failure documenting a real, already-logged application defect.
 * Until each of the 500-correlated failures has been rerun serially and confirmed to
 * reproduce in isolation, they must be classified as "Environment" in the defect log, not
 * "Confirmed" — and never counted as passing. fullyParallel/workers below are set to force
 * serial execution locally until that reconciliation is done; raise them back only after
 * confirming the lab VM holds up under concurrent load.
 */
const FINSERVE_BASE_URL = process.env.FINSERVE_BASE_URL || 'http://localhost:8082';
const INSURANCE_BASE_URL = process.env.INSURANCE_BASE_URL || 'http://localhost:8081';
const isCI = process.env.CI === 'true';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,

  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // --- FinServe Retail Demo (this repo's active suite) ---
    {
      name: 'finserve-chromium',
      testDir: './tests',
      testIgnore: '**/insurance-order-entry/**',
      use: { ...devices['Desktop Chrome'], baseURL: FINSERVE_BASE_URL },
    },
    {
      name: 'finserve-firefox',
      testDir: './tests',
      testIgnore: '**/insurance-order-entry/**',
      use: { ...devices['Desktop Firefox'], baseURL: FINSERVE_BASE_URL },
    },
    {
      name: 'finserve-webkit',
      testDir: './tests',
      testIgnore: '**/insurance-order-entry/**',
      use: { ...devices['Desktop Safari'], baseURL: FINSERVE_BASE_URL },
    },
    {
      name: 'finserve-mobile-chrome',
      testDir: './tests',
      testIgnore: '**/insurance-order-entry/**',
      use: { ...devices['Pixel 7'], baseURL: FINSERVE_BASE_URL },
    },
    // --- Insurance Order Entry Demo (placeholder — add tests under tests/insurance-order-entry/) ---
    {
      name: 'insurance-chromium',
      testDir: './tests/insurance-order-entry',
      use: { ...devices['Desktop Chrome'], baseURL: INSURANCE_BASE_URL },
    },
  ],

  outputDir: 'reports/test-results',
});
