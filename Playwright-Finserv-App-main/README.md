# FinServe Retail Demo — Playwright QA Automation

Playwright + JavaScript automation suite for the **FinServe Retail Demo Platform**, one of two
demo apps on the shared **Combined QA Lab** VM (Laravel + MySQL training sandbox simulating a
customer-facing Mutual Fund + Insurance retail platform).

Per the Combined QA Lab Learner Guide, your lab VM hosts:
- **FinServe Retail Demo** — `http://<your-lab-vm-ip>:8082/login` (this repo's active suite)
- **Insurance Order Entry Demo** — `http://<your-lab-vm-ip>:8081/login` (placeholder only — see
  `tests/insurance-order-entry/`)

Auth: session login via `login-email` / `login-password` / `login-submit` test IDs, plus a static
`X-API-Key` header for API tests. Modules covered: Auth, Dashboard, Mutual Funds
(discovery/invest), Portfolio/Redemption, Insurance (discovery/purchase), Policies, Transactions,
API/reporting layer.

> Earlier drafts of this suite assumed a single-app VM at a fixed IP (from the FinServe handover
> doc). The Combined QA Lab Learner Guide is the more current/authoritative source — this version
> is aligned to it: base URLs come from `FINSERVE_BASE_URL` / `INSURANCE_BASE_URL`, not a hardcoded
> IP, and login locators use `getByTestId('login-email' | 'login-password' | 'login-submit')`.

## 1. Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env
# Edit .env: set LAB_HOST / FINSERVE_BASE_URL to your assigned learner VM IP, e.g.
#   FINSERVE_BASE_URL=http://<your-lab-vm-ip>:8082
# Never commit the real .env file.
```

## 2. Running tests

```bash
npm test                              # full suite, all FinServe projects (chromium/firefox/webkit/mobile)
npm run test:smoke                    # @smoke tagged tests only
npm run test:regression               # @regression tagged tests only
npm run test:auth                     # single module
npm run test:mutual-funds
npm run test:portfolio
npm run test:insurance
npm run test:transactions
npm run test:api
npm run test:headed                   # watch the browser
npm run test:debug                    # Playwright inspector
npm run report                        # open the last HTML report

# Run against a specific project (per playwright.config.js)
npx playwright test --project=finserve-chromium
npx playwright test --project=insurance-chromium   # placeholder login smoke test only
```

Reports, traces, videos, and screenshots are written to `reports/` (HTML report, JSON results,
and per-test artifacts on failure — see `playwright.config.js`).

## 3. Project structure

```
financial-services-playwright-automation/
  tests/
    auth/            login, logout, session, lockout
    dashboard/        portfolio/policy summary, navigation, reconciliation
    mutual-funds/     discovery, filters, investment (SIP/lumpsum), boundaries
    portfolio/        holdings, redemption (amount/units, balance validation)
    insurance/        discovery, purchase, policy management
    transactions/     history, filters, UI/API freshness
    api/              health, auth, funds, portfolio, orders, policies, transactions
    insurance-order-entry/   placeholder login smoke test for the separate Insurance app (:8081)
  pages/               Page Object Model — one class per screen
  fixtures/
    users.js            seeded users (qauser, investor1, newuser, insurance1, locked, learner001-020)
    testData.js        funds, insurance products, routes, API endpoints, boundary values
    auth.fixture.js    pre-authenticated page fixtures (qaUserPage, investorPage, ...)
  utils/
    apiClient.js        thin wrapper over Playwright's APIRequestContext with X-API-Key auth
    dataGenerator.js   random emails/phones/amounts/dates for isolated test data
    assertions.js       currency parsing, UI/API reconciliation helpers
    testHelpers.js      evidence capture, toast/message waits, download capture
  playwright.config.js  chromium/firefox/webkit/mobile-chrome, trace/video/screenshot on failure
  .github/workflows/playwright.yml   smoke on every push/PR, full regression nightly + on PR
```

## 4. Locator strategy

Page objects prefer `getByRole`, `getByLabel`, and `data-testid` selectors. Several `data-testid`
values (e.g. `portfolio-total-value`, `fund-row`, `holding-row`, `insurance-product-card`) are
**placeholders** based on the naming conventions implied by the app's documented data dictionary and
routes — confirm the actual attributes against the live DOM (`Inspect` in DevTools, or a Playwright
codegen session: `npx playwright codegen http://34.101.161.244/login`) and adjust the locators in
`pages/*.js` before relying on the suite for real defect detection.

## 5. Seeded users (from the handover doc)

| User | Purpose |
|---|---|
| `qauser@finserve.test` | Standard QA demo user |
| `investor1@finserve.test` | Has existing mutual fund holdings (redemption tests) |
| `newuser@finserve.test` | No holdings/policies — empty-state tests |
| `insurance1@finserve.test` | Has existing policies |
| `locked@finserve.test` | Negative auth test |
| `learner001`–`learner020@finserve.test` | Parallel/isolated test data per learner |

All seeded users share `Password@123` unless your cohort's `.env` overrides them.

## 6. What's covered vs. what's a starting point

**Structurally complete:** framework skeleton, Page Object Model, fixtures, API client, CI workflow,
smoke + regression tagging, boundary/negative test scenarios per the Problem Statement's known-issue
list (stale dashboard values, minimum-investment validation, redemption exceeding balance, premium
recalculation, transaction freshness, UI/API reconciliation).

**You'll need to confirm/adjust:**
- Exact `data-testid` attributes and error-message copy once you've inspected the live app.
- Real API response shapes for `/api/*` endpoints (the spec assumes REST conventions with a `data`
  wrapper; adjust `expectOkJson` usage if the API differs).
- Whether the API requires a bearer token in addition to `X-API-Key` for user-scoped endpoints
  (portfolio, orders) — currently the `portfolio` API test accepts either `200` or `401` until this
  is confirmed.
- Actual documented minimum investment amount (`investmentAmounts.boundaryMinimum` in
  `fixtures/testData.js` is a placeholder).

## 7. Known limitations

- **Shared lab VM cannot handle fully-parallel cross-browser runs.** The 2026-08-17 run (see
  `reports/test-results/`) produced 14 distinct failing tests across 20 browser-project
  executions; 13 of those 14 returned an identical `500 Server Error` from the backend at
  `34.93.84.32:8082`. `playwright.config.js` now forces serial execution (`workers: 1`,
  `fullyParallel: false`) until each failure has been rerun in isolation and classified as
  either a real defect or Environment noise — do not raise parallelism back up without
  re-confirming the VM holds under load.
- Auth fixtures log in via the UI per test rather than reusing `storageState` — simpler to read for a
  learning project, but slower at scale, and each fresh login is one more request the shared VM has
  to serve under load. Switch to a `globalSetup` that saves `storageState` per role if suite runtime
  becomes a problem, but treat this as secondary to fixing the parallelism issue above.
- Redemption/holding-detail tests assume the holding ID can be parsed from the URL after opening a row
  from the portfolio page; adjust if the app uses a different navigation pattern (e.g. a modal instead
  of a route change).
- Disable `APP_DEBUG` and rotate the demo API key before any learner rollout, per the handover doc's
  access rules.
- `DEF-FS-002` (candidate, in `tests/mutual-funds/mutual-funds.spec.js`) — sorting by 1-Year Return
  appears not to reorder results. The test is written and asserts correct behavior, but its
  `SORT_OPTION_LABEL` constant is still a placeholder pending DevTools confirmation of the sort
  dropdown's real option text.
