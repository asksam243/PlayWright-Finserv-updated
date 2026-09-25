const { expect } = require('@playwright/test');

class InvestmentPage {
  constructor(page) {
    this.page = page;
    // Confirmed via DevTools: <div data-testid="investment-page">
    this.investmentPage = page.getByTestId('investment-page');
    // Confirmed via DevTools: <input type="radio" name="investment_type" value="SIP" data-testid="investment-type-sip">
    // Lumpsum follows the same naming pattern (investment-type-lumpsum) — inferred from the
    // confirmed SIP pattern, not separately screenshotted. Flag if lumpsum tests fail on this.
    this.sipOption = page.getByTestId('investment-type-sip');
    this.lumpsumOption = page.getByTestId('investment-type-lumpsum');
    // Confirmed via DevTools: <input id="amount" data-testid="investment-amount-input">
    this.amountInput = page.getByTestId('investment-amount-input');
    // Confirmed via DevTools: <select id="payment_method" data-testid="payment-method-select">
    // This field wasn't in the original Problem Statement doc's assumptions but is required
    // by the real form (UPI / Net Banking / Debit Card / Wallet).
    this.paymentMethodSelect = page.getByTestId('payment-method-select');
    // Confirmed via DevTools: <input type="checkbox" data-testid="investment-declaration-checkbox">
    this.declarationCheckbox = page.getByTestId('investment-declaration-checkbox');
    // Confirmed via DevTools: <button data-testid="confirm-investment-button">Confirm Investment</button>
    this.confirmButton = page.getByTestId('confirm-investment-button');
    // Confirmed via DevTools: <p class="field-error" data-testid="investment-error">
    this.validationError = page.getByTestId('investment-error');
    // Confirmed via DevTools: <section class="success-panel" data-testid="investment-confirmation-message">
    this.confirmationBanner = page.getByTestId('investment-confirmation-message');
    // The transaction ID is embedded in text like "Transaction: TXN-20260724110236-T4ZU1"
    // inside the confirmation panel — there's no separate dedicated element for just the ID.
    this.transactionIdText = this.confirmationBanner.locator('p', { hasText: 'Transaction:' });
  }

  async selectSip() {
    await this.sipOption.check();
  }

  async selectLumpsum() {
    await this.lumpsumOption.check();
  }

  async enterAmount(amount) {
    await this.amountInput.fill(String(amount));
  }

  async selectPaymentMethod(method = 'UPI') {
    await this.paymentMethodSelect.selectOption({ label: method });
  }

  async acceptDeclaration() {
    await this.declarationCheckbox.check();
  }

  async confirmInvestment() {
    // Payment method is a required field on the real form (confirmed via DevTools) but wasn't
    // part of the original test flow — default to UPI if nothing's been selected yet, so
    // existing tests that don't care about payment method still submit successfully.
    const currentValue = await this.paymentMethodSelect.inputValue();
    if (!currentValue) {
      await this.selectPaymentMethod('UPI');
    }
    await this.confirmButton.click();
  }

  async expectValidationError(pattern) {
    await expect(this.validationError).toBeVisible();
    if (pattern) await expect(this.validationError).toHaveText(pattern);
  }

  async expectConfirmed() {
    await expect(this.confirmationBanner).toBeVisible();
  }

  async getTransactionId() {
    const text = await this.transactionIdText.innerText();
    // Extract just the "TXN-..." token from the full "Transaction: TXN-20260724110236-T4ZU1" text.
    const match = text.match(/TXN-[\w-]+/i);
    return match ? match[0] : text.trim();
  }
}

module.exports = { InvestmentPage };