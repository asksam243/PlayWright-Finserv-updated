const { expect } = require('@playwright/test');

class RedemptionPage {
  constructor(page) {
    this.page = page;
    // Confirmed via DevTools: <div class="container py-4" data-testid="redemption-page">
    this.redemptionPage = page.getByTestId('redemption-page');
    // Confirmed via DevTools: Holding Summary panel fields
    this.fundNameText = page.getByTestId('redemption-fund-name');
    this.availableUnitsText = page.getByTestId('available-units');
    // Confirmed via DevTools: <input type="radio" name="redemption_mode" value="units" data-testid="redeem-mode-units">
    this.redeemByUnitsOption = page.getByTestId('redeem-mode-units');
    this.redeemByAmountOption = page.getByTestId('redeem-mode-amount');
    // Confirmed via DevTools: <input id="units" data-testid="redeem-units-input">
    this.unitsInput = page.getByTestId('redeem-units-input');
    this.amountInput = page.getByTestId('redeem-amount-input');
    // Confirmed via DevTools: <input type="checkbox" data-testid="redemption-declaration-checkbox">
    this.declarationCheckbox = page.getByTestId('redemption-declaration-checkbox');
    // Confirmed via DevTools: <button data-testid="confirm-redemption-button">Confirm Redemption</button>
    this.confirmButton = page.getByTestId('confirm-redemption-button');
    // Confirmed via DevTools: this is a page-level error summary (same pattern as the
    // investment form's error box), not a per-field error message —
    // <div class="alert alert-error" data-testid="form-error-summary">
    this.validationError = page.getByTestId('form-error-summary');
    // Confirmed via DevTools: successful submission navigates to an ENTIRELY DIFFERENT route,
    // /redemptions/confirmation (not an inline panel like the investment flow was).
    this.confirmationBanner = page.getByTestId('redemption-confirmation-page');
    this.redemptionStatusText = page.getByTestId('redemption-confirmation-message');
  }

  async redeemByAmount(amount) {
    await this.redeemByAmountOption.check();
    await this.amountInput.fill(String(amount));
  }

  async redeemByUnits(units) {
    await this.redeemByUnitsOption.check();
    await this.unitsInput.fill(String(units));
  }

  async getAvailableBalanceText() {
    return (await this.availableUnitsText.innerText()).trim();
  }

  async confirm() {
    // Declaration checkbox is mandatory on the real form. Auto-check it here unless a test is
    // specifically exercising the missing-declaration case (use confirmWithoutDeclaration()
    // for that instead), so amount/unit-focused tests don't get an unrelated failure.
    const isChecked = await this.declarationCheckbox.isChecked();
    if (!isChecked) {
      await this.declarationCheckbox.check();
    }
    await this.confirmButton.click();
  }

  async confirmWithoutDeclaration() {
    await this.confirmButton.click();
  }

  async expectValidationError(pattern) {
    await expect(this.validationError).toBeVisible();
    if (pattern) await expect(this.validationError).toHaveText(pattern);
  }

  async expectConfirmed() {
    await expect(this.confirmationBanner).toBeVisible();
  }

  async getStatus() {
    return (await this.redemptionStatusText.innerText()).trim();
  }
}

module.exports = { RedemptionPage };