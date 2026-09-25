# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mutual-funds\investment.spec.js >> Mutual Fund Investment @mutual-funds >> SIP investment below minimum is rejected with a clear validation message @regression
- Location: tests\mutual-funds\investment.spec.js:26:3

# Error details

```
TimeoutError: locator.check: Timeout 20000ms exceeded.
Call log:
  - waiting for getByTestId('investment-type-sip')

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
  2  | 
  3  | class InvestmentPage {
  4  |   constructor(page) {
  5  |     this.page = page;
  6  |     // Confirmed via DevTools: <div data-testid="investment-page">
  7  |     this.investmentPage = page.getByTestId('investment-page');
  8  |     // Confirmed via DevTools: <input type="radio" name="investment_type" value="SIP" data-testid="investment-type-sip">
  9  |     // Lumpsum follows the same naming pattern (investment-type-lumpsum) — inferred from the
  10 |     // confirmed SIP pattern, not separately screenshotted. Flag if lumpsum tests fail on this.
  11 |     this.sipOption = page.getByTestId('investment-type-sip');
  12 |     this.lumpsumOption = page.getByTestId('investment-type-lumpsum');
  13 |     // Confirmed via DevTools: <input id="amount" data-testid="investment-amount-input">
  14 |     this.amountInput = page.getByTestId('investment-amount-input');
  15 |     // Confirmed via DevTools: <select id="payment_method" data-testid="payment-method-select">
  16 |     // This field wasn't in the original Problem Statement doc's assumptions but is required
  17 |     // by the real form (UPI / Net Banking / Debit Card / Wallet).
  18 |     this.paymentMethodSelect = page.getByTestId('payment-method-select');
  19 |     // Confirmed via DevTools: <input type="checkbox" data-testid="investment-declaration-checkbox">
  20 |     this.declarationCheckbox = page.getByTestId('investment-declaration-checkbox');
  21 |     // Confirmed via DevTools: <button data-testid="confirm-investment-button">Confirm Investment</button>
  22 |     this.confirmButton = page.getByTestId('confirm-investment-button');
  23 |     // Confirmed via DevTools: <p class="field-error" data-testid="investment-error">
  24 |     this.validationError = page.getByTestId('investment-error');
  25 |     // Confirmed via DevTools: <section class="success-panel" data-testid="investment-confirmation-message">
  26 |     this.confirmationBanner = page.getByTestId('investment-confirmation-message');
  27 |     // The transaction ID is embedded in text like "Transaction: TXN-20260724110236-T4ZU1"
  28 |     // inside the confirmation panel — there's no separate dedicated element for just the ID.
  29 |     this.transactionIdText = this.confirmationBanner.locator('p', { hasText: 'Transaction:' });
  30 |   }
  31 | 
  32 |   async selectSip() {
> 33 |     await this.sipOption.check();
     |                          ^ TimeoutError: locator.check: Timeout 20000ms exceeded.
  34 |   }
  35 | 
  36 |   async selectLumpsum() {
  37 |     await this.lumpsumOption.check();
  38 |   }
  39 | 
  40 |   async enterAmount(amount) {
  41 |     await this.amountInput.fill(String(amount));
  42 |   }
  43 | 
  44 |   async selectPaymentMethod(method = 'UPI') {
  45 |     await this.paymentMethodSelect.selectOption({ label: method });
  46 |   }
  47 | 
  48 |   async acceptDeclaration() {
  49 |     await this.declarationCheckbox.check();
  50 |   }
  51 | 
  52 |   async confirmInvestment() {
  53 |     // Payment method is a required field on the real form (confirmed via DevTools) but wasn't
  54 |     // part of the original test flow — default to UPI if nothing's been selected yet, so
  55 |     // existing tests that don't care about payment method still submit successfully.
  56 |     const currentValue = await this.paymentMethodSelect.inputValue();
  57 |     if (!currentValue) {
  58 |       await this.selectPaymentMethod('UPI');
  59 |     }
  60 |     await this.confirmButton.click();
  61 |   }
  62 | 
  63 |   async expectValidationError(pattern) {
  64 |     await expect(this.validationError).toBeVisible();
  65 |     if (pattern) await expect(this.validationError).toHaveText(pattern);
  66 |   }
  67 | 
  68 |   async expectConfirmed() {
  69 |     await expect(this.confirmationBanner).toBeVisible();
  70 |   }
  71 | 
  72 |   async getTransactionId() {
  73 |     const text = await this.transactionIdText.innerText();
  74 |     // Extract just the "TXN-..." token from the full "Transaction: TXN-20260724110236-T4ZU1" text.
  75 |     const match = text.match(/TXN-[\w-]+/i);
  76 |     return match ? match[0] : text.trim();
  77 |   }
  78 | }
  79 | 
  80 | module.exports = { InvestmentPage };
```