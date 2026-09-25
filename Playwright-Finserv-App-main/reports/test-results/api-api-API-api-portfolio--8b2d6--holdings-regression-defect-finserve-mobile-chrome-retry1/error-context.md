# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\api.spec.js >> API @api >> portfolio summary total reconciles with sum of individual holdings @regression @defect
- Location: tests\api\api.spec.js:79:3

# Error details

```
Error: Reported total (1426505.02) vs sum of holdings (1425506.02) differ by 999

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 0.01
Received:    999
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const { apiClient } = require('../../utils/apiClient');
  3  | const { expectOkJson } = require('../../utils/assertions');
  4  | const { apiEndpoints,mutualFunds } = require('../../fixtures/testData');
  5  | const { users } = require('../../fixtures/users');
  6  | 
  7  | test.describe('API @api', () => {
  8  |   test.afterAll(async () => {
  9  |     await apiClient.dispose();
  10 |   });
  11 | 
  12 |   test('health endpoint responds OK @smoke', async () => {
  13 |     const response = await apiClient.get(apiEndpoints.health);
  14 |     expect(response.ok()).toBeTruthy();
  15 |   });
  16 | 
  17 |   test('login endpoint validates credentials and returns user details @smoke', async () => {
  18 |   const response = await apiClient.post(apiEndpoints.login, {
  19 |     email: users.qaUser.email,
  20 |     password: users.qaUser.password,
  21 |   });
  22 |   const body = await expectOkJson(response);
  23 |   expect(body.status).toBe('success');
  24 |   expect(body.data.user.email).toBe(users.qaUser.email);
  25 |   expect(body.data.user).toHaveProperty('account_status');
  26 | });
  27 | 
  28 |   test('login endpoint rejects invalid credentials with 401/422 @regression', async () => {
  29 |     const response = await apiClient.post(apiEndpoints.login, {
  30 |       email: users.qaUser.email,
  31 |       password: 'WrongPassword@1',
  32 |     });
  33 |     expect([401, 422]).toContain(response.status());
  34 |   });
  35 | 
  36 |   test('mutual fund listing endpoint returns an array of funds @regression', async () => {
  37 |     const response = await apiClient.get(apiEndpoints.funds);
  38 |     const body = await expectOkJson(response);
  39 |     expect(Array.isArray(body.data ?? body)).toBeTruthy();
  40 |   });
  41 | 
  42 |   test('mutual fund detail endpoint returns fund fields matching schema @regression', async () => {
  43 |     const response = await apiClient.get(apiEndpoints.fundDetail(mutualFunds.confirmedSample.id));  // ← changed this line
  44 |     const body = await expectOkJson(response);
  45 |     const fund = body.data ?? body;
  46 |     expect(fund).toHaveProperty('fund_code');
  47 |     expect(fund).toHaveProperty('fund_name');
  48 |     expect(fund).toHaveProperty('risk_level');
  49 |   });
  50 | 
  51 |   test('portfolio endpoint requires authentication and returns holdings for a valid user @regression', async () => {
  52 |     const response = await apiClient.get(apiEndpoints.portfolio);
  53 |     // Depending on the app's auth model this may require a bearer token; adjust once confirmed.
  54 |     expect([200, 401]).toContain(response.status());
  55 |   });
  56 | 
  57 |   test('orders endpoint reflects a newly created transaction @regression', async () => {
  58 |     const response = await apiClient.get(apiEndpoints.orders);
  59 |     const body = await expectOkJson(response);
  60 |     expect(Array.isArray(body.data ?? body)).toBeTruthy();
  61 |   });
  62 | 
  63 |   test('policies endpoint returns policy records with a valid status enum @regression', async () => {
  64 |     const response = await apiClient.get(apiEndpoints.policies);
  65 |     const body = await expectOkJson(response);
  66 |     const policies = body.data ?? body;
  67 |     for (const policy of policies) {
  68 |       expect(['Pending Issuance', 'Active', 'Cancelled', 'Expired']).toContain(policy.status);
  69 |     }
  70 |   });
  71 | 
  72 |   test('transactions endpoint returns the latest transaction consistent with UI expectations @regression', async () => {
  73 |     const response = await apiClient.get(apiEndpoints.transactions);
  74 |     const body = await expectOkJson(response);
  75 |     expect(Array.isArray(body.data ?? body)).toBeTruthy();
  76 |   });
  77 | 
  78 |   // Add to tests/api/api.spec.js
  79 |   test('portfolio summary total reconciles with sum of individual holdings @regression @defect', async () => {
  80 |     const response = await apiClient.get(apiEndpoints.portfolio);
  81 |     const body = await expectOkJson(response);
  82 |     const { reported_portfolio_total, sum_of_holding_values } = body.data.summary;
  83 | 
  84 |     // Allow a tiny rounding tolerance (paise-level), but flag any real drift.
  85 |     const diff = Math.abs(reported_portfolio_total - sum_of_holding_values);
> 86 |     expect(diff, `Reported total (${reported_portfolio_total}) vs sum of holdings (${sum_of_holding_values}) differ by ${diff}`).toBeLessThanOrEqual(0.01);
     |                                                                                                                                  ^ Error: Reported total (1426505.02) vs sum of holdings (1425506.02) differ by 999
  87 | });
  88 | });
  89 | 
```