const { expect } = require('@playwright/test');
const { routes } = require('../fixtures/testData');

class LoginPage {
  constructor(page) {
    this.page = page;
    // Confirmed against the Combined QA Lab Learner Guide's minimal login example:
    // login-email / login-password / login-submit data-testid attributes.
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.loginButton = page.getByTestId('login-submit');
    this.errorMessage = page.locator('.field-error').first();
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto(routes.login);
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginError(expectedMessagePattern) {
    await expect(this.errorMessage).toBeVisible();
    if (expectedMessagePattern) {
      await expect(this.errorMessage).toHaveText(expectedMessagePattern);
    }
  }

  async logout() {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/login/);
  }

  async expectRedirectedToLoginWhenUnauthenticated(protectedRoute) {
    await this.page.goto(protectedRoute);
    await expect(this.page).toHaveURL(/login/);
  }
}

module.exports = { LoginPage };
