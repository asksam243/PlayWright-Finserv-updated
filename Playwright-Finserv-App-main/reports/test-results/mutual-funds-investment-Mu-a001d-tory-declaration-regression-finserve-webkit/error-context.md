# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mutual-funds\investment.spec.js >> Mutual Fund Investment @mutual-funds >> confirmation is not shown without accepting the mandatory declaration @regression
- Location: tests\mutual-funds\investment.spec.js:41:3

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/login$/
Received string: "http://34.93.84.32:8082/login"
Timeout: 10000ms

Call log:
  - Expect "not toHaveURL" with timeout 10000ms
    22 × unexpected value "http://34.93.84.32:8082/login"

```

```yaml
- main:
  - heading "500" [level=1]
  - text: Server Error
```

# Test source

```ts
  1  | const base = require('@playwright/test');
  2  | const { LoginPage } = require('../pages/LoginPage');
  3  | const { users } = require('./users');
  4  | 
  5  | /**
  6  |  * Extends the base Playwright test with pre-authenticated pages so individual
  7  |  * spec files don't need to repeat login steps. Storage state is not reused across
  8  |  * workers here (kept simple/explicit for a training project); for larger suites,
  9  |  * switch to storageState-based auth for speed.
  10 |  */
  11 | async function loginAs(page, user) {
  12 |   const loginPage = new LoginPage(page);
  13 |   await loginPage.goto();
  14 |   await loginPage.login(user.email, user.password);
  15 |   // Matches the Combined QA Lab Learner Guide's minimal login pattern: assert we left /login
  16 |   // rather than assuming a specific post-login route, since that's more resilient to app changes.
> 17 |   await base.expect(page).not.toHaveURL(/\/login$/, { timeout: 10_000 });
     |                               ^ Error: expect(page).not.toHaveURL(expected) failed
  18 | }
  19 | 
  20 | const test = base.test.extend({
  21 |   qaUserPage: async ({ page }, use) => {
  22 |     await loginAs(page, users.qaUser);
  23 |     await use(page);
  24 |   },
  25 |   investorPage: async ({ page }, use) => {
  26 |     await loginAs(page, users.investor);
  27 |     await use(page);
  28 |   },
  29 |   insuranceUserPage: async ({ page }, use) => {
  30 |     await loginAs(page, users.insuranceUser);
  31 |     await use(page);
  32 |   },
  33 |   newUserPage: async ({ page }, use) => {
  34 |     await loginAs(page, users.newUser);
  35 |     await use(page);
  36 |   },
  37 | });
  38 | 
  39 | module.exports = { test, expect: base.expect };
  40 | 
```