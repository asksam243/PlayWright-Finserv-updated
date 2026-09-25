# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard\dashboard.spec.js >> Dashboard @dashboard >> portfolio value on dashboard reconciles with portfolio page total @regression
- Location: tests\dashboard\dashboard.spec.js:29:3

# Error details

```
TimeoutError: locator.fill: Timeout 20000ms exceeded.
Call log:
  - waiting for getByTestId('login-email')

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e4]:
    - heading "500" [level=1] [ref=e5]
    - generic [ref=e6]: Server Error
```

# Test source

```ts
  1  | const { expect } = require('@playwright/test');
  2  | const { routes } = require('../fixtures/testData');
  3  | 
  4  | class LoginPage {
  5  |   constructor(page) {
  6  |     this.page = page;
  7  |     // Confirmed against the Combined QA Lab Learner Guide's minimal login example:
  8  |     // login-email / login-password / login-submit data-testid attributes.
  9  |     this.emailInput = page.getByTestId('login-email');
  10 |     this.passwordInput = page.getByTestId('login-password');
  11 |     this.loginButton = page.getByTestId('login-submit');
  12 |     this.errorMessage = page.locator('.field-error').first();
  13 |     this.logoutButton = page.getByTestId('logout-button');
  14 |   }
  15 | 
  16 |   async goto() {
  17 |     await this.page.goto(routes.login);
  18 |   }
  19 | 
  20 |   async login(email, password) {
> 21 |     await this.emailInput.fill(email);
     |                           ^ TimeoutError: locator.fill: Timeout 20000ms exceeded.
  22 |     await this.passwordInput.fill(password);
  23 |     await this.loginButton.click();
  24 |   }
  25 | 
  26 |   async expectLoginError(expectedMessagePattern) {
  27 |     await expect(this.errorMessage).toBeVisible();
  28 |     if (expectedMessagePattern) {
  29 |       await expect(this.errorMessage).toHaveText(expectedMessagePattern);
  30 |     }
  31 |   }
  32 | 
  33 |   async logout() {
  34 |     await this.logoutButton.click();
  35 |     await expect(this.page).toHaveURL(/login/);
  36 |   }
  37 | 
  38 |   async expectRedirectedToLoginWhenUnauthenticated(protectedRoute) {
  39 |     await this.page.goto(protectedRoute);
  40 |     await expect(this.page).toHaveURL(/login/);
  41 |   }
  42 | }
  43 | 
  44 | module.exports = { LoginPage };
  45 | 
```