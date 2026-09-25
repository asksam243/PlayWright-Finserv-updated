const { test, expect } = require('../../fixtures/auth.fixture');
const { LoginPage } = require('../../pages/LoginPage');
const { users, invalidUser } = require('../../fixtures/users');
const { routes } = require('../../fixtures/testData');

test.describe('Authentication @auth', () => {
  test('valid user can log in and reach dashboard @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.qaUser.email, users.qaUser.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('invalid credentials show an error and do not navigate @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(invalidUser.email, invalidUser.password);
    await loginPage.expectLoginError();
    await expect(page).toHaveURL(/login/);
  });

  test('locked account is prevented from logging in @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.lockedUser.email, users.lockedUser.password);
    await loginPage.expectLoginError(/locked/i);
  });

  test('empty email/password shows validation without a server round trip @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(page).toHaveURL(/login/);
  });

  test('logged-in user can log out and loses access to protected routes @smoke', async ({ qaUserPage }) => {
    const loginPage = new LoginPage(qaUserPage);
    await loginPage.logout();
    await loginPage.expectRedirectedToLoginWhenUnauthenticated(routes.dashboard);
  });

  test('unauthenticated user is redirected to login for protected routes @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    for (const route of [routes.dashboard, routes.portfolio, routes.policies, routes.transactions]) {
      await loginPage.expectRedirectedToLoginWhenUnauthenticated(route);
    }
  });
});
