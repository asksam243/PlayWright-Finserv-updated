const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { users } = require('./users');

/**
 * Extends the base Playwright test with pre-authenticated pages so individual
 * spec files don't need to repeat login steps. Storage state is not reused across
 * workers here (kept simple/explicit for a training project); for larger suites,
 * switch to storageState-based auth for speed.
 */
async function loginAs(page, user) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  // Matches the Combined QA Lab Learner Guide's minimal login pattern: assert we left /login
  // rather than assuming a specific post-login route, since that's more resilient to app changes.
  await base.expect(page).not.toHaveURL(/\/login$/, { timeout: 10_000 });
}

const test = base.test.extend({
  qaUserPage: async ({ page }, use) => {
    await loginAs(page, users.qaUser);
    await use(page);
  },
  investorPage: async ({ page }, use) => {
    await loginAs(page, users.investor);
    await use(page);
  },
  insuranceUserPage: async ({ page }, use) => {
    await loginAs(page, users.insuranceUser);
    await use(page);
  },
  newUserPage: async ({ page }, use) => {
    await loginAs(page, users.newUser);
    await use(page);
  },
});

module.exports = { test, expect: base.expect };
