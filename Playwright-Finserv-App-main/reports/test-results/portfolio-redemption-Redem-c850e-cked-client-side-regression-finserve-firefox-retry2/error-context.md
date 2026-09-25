# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio\redemption.spec.js >> Redemption Flow @portfolio >> zero-amount redemption is blocked client-side @regression
- Location: tests\portfolio\redemption.spec.js:32:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('form-error-summary')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByTestId('form-error-summary')

```

```yaml
- main:
  - heading "500" [level=1]
  - text: Server Error
```

# Test source

```ts
  1  | const { expect } = require('@playwright/test');
  2  | 
  3  | class RedemptionPage {
  4  |   constructor(page) {
  5  |     this.page = page;
  6  |     // Confirmed via DevTools: <div class="container py-4" data-testid="redemption-page">
  7  |     this.redemptionPage = page.getByTestId('redemption-page');
  8  |     // Confirmed via DevTools: Holding Summary panel fields
  9  |     this.fundNameText = page.getByTestId('redemption-fund-name');
  10 |     this.availableUnitsText = page.getByTestId('available-units');
  11 |     // Confirmed via DevTools: <input type="radio" name="redemption_mode" value="units" data-testid="redeem-mode-units">
  12 |     this.redeemByUnitsOption = page.getByTestId('redeem-mode-units');
  13 |     this.redeemByAmountOption = page.getByTestId('redeem-mode-amount');
  14 |     // Confirmed via DevTools: <input id="units" data-testid="redeem-units-input">
  15 |     this.unitsInput = page.getByTestId('redeem-units-input');
  16 |     this.amountInput = page.getByTestId('redeem-amount-input');
  17 |     // Confirmed via DevTools: <input type="checkbox" data-testid="redemption-declaration-checkbox">
  18 |     this.declarationCheckbox = page.getByTestId('redemption-declaration-checkbox');
  19 |     // Confirmed via DevTools: <button data-testid="confirm-redemption-button">Confirm Redemption</button>
  20 |     this.confirmButton = page.getByTestId('confirm-redemption-button');
  21 |     // Confirmed via DevTools: this is a page-level error summary (same pattern as the
  22 |     // investment form's error box), not a per-field error message —
  23 |     // <div class="alert alert-error" data-testid="form-error-summary">
  24 |     this.validationError = page.getByTestId('form-error-summary');
  25 |     // Confirmed via DevTools: successful submission navigates to an ENTIRELY DIFFERENT route,
  26 |     // /redemptions/confirmation (not an inline panel like the investment flow was).
  27 |     this.confirmationBanner = page.getByTestId('redemption-confirmation-page');
  28 |     this.redemptionStatusText = page.getByTestId('redemption-confirmation-message');
  29 |   }
  30 | 
  31 |   async redeemByAmount(amount) {
  32 |     await this.redeemByAmountOption.check();
  33 |     await this.amountInput.fill(String(amount));
  34 |   }
  35 | 
  36 |   async redeemByUnits(units) {
  37 |     await this.redeemByUnitsOption.check();
  38 |     await this.unitsInput.fill(String(units));
  39 |   }
  40 | 
  41 |   async getAvailableBalanceText() {
  42 |     return (await this.availableUnitsText.innerText()).trim();
  43 |   }
  44 | 
  45 |   async confirm() {
  46 |     // Declaration checkbox is mandatory on the real form. Auto-check it here unless a test is
  47 |     // specifically exercising the missing-declaration case (use confirmWithoutDeclaration()
  48 |     // for that instead), so amount/unit-focused tests don't get an unrelated failure.
  49 |     const isChecked = await this.declarationCheckbox.isChecked();
  50 |     if (!isChecked) {
  51 |       await this.declarationCheckbox.check();
  52 |     }
  53 |     await this.confirmButton.click();
  54 |   }
  55 | 
  56 |   async confirmWithoutDeclaration() {
  57 |     await this.confirmButton.click();
  58 |   }
  59 | 
  60 |   async expectValidationError(pattern) {
> 61 |     await expect(this.validationError).toBeVisible();
     |                                        ^ Error: expect(locator).toBeVisible() failed
  62 |     if (pattern) await expect(this.validationError).toHaveText(pattern);
  63 |   }
  64 | 
  65 |   async expectConfirmed() {
  66 |     await expect(this.confirmationBanner).toBeVisible();
  67 |   }
  68 | 
  69 |   async getStatus() {
  70 |     return (await this.redemptionStatusText.innerText()).trim();
  71 |   }
  72 | }
  73 | 
  74 | module.exports = { RedemptionPage };
```