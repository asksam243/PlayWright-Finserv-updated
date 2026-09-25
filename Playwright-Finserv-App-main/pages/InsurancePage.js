const { expect } = require('@playwright/test');
const { routes } = require('../fixtures/testData');

class InsurancePage {
  constructor(page) {
    this.page = page;
    // Confirmed via DevTools inspection of the real /insurance page.
    this.searchInput = page.getByTestId('insurance-search-input');
    this.typeFilter = page.getByTestId('insurance-type-filter');
    this.premiumRangeFilter = page.getByTestId('premium-range-filter');
    // Apply/Reset button testids weren't directly confirmed, but their visible text was.
    this.applyButton = page.getByRole('button', { name: 'Apply' });
    // Product cards: <article class="product-card" data-testid="insurance-card-{CODE}">
    this.productCards = page.locator('[data-testid^="insurance-card-"]');
  }

  async goto() {
    await this.page.goto(routes.insurance);
  }

  async filterByCategory(category) {
    await this.typeFilter.selectOption({ label: category });
    await this.applyButton.click();
  }

  async expectProductsVisible(min = 1) {
    expect(await this.productCards.count()).toBeGreaterThanOrEqual(min);
  }

  // Confirmed via DevTools: View Details link testid follows "insurance-details-link-{CODE}"
  async openProductByCode(productCode) {
    await this.page.getByTestId(`insurance-details-link-${productCode}`).click();
  }

  // Confirmed via DevTools: Buy link testid follows "buy-insurance-link-{CODE}" on the listing
  // page, navigating to /buy-insurance/{numeric id} — clicking it avoids needing to guess or
  // hardcode that numeric id ourselves (same pattern as mutual funds' View Details link).
  async gotoBuyFlow(productCode) {
    await this.goto();
    await this.page.getByTestId(`buy-insurance-link-${productCode}`).click();
  }

  // --- Buy-insurance flow ---
  // NOTE: confirmed via DevTools that the real buy-insurance form has NO coverage/tenure
  // selection fields at all — each product has one fixed coverage amount and premium, shown
  // read-only in the purchase summary panel. There is nothing to select/recalculate here.

  get insuredNameInput() {
    return this.page.getByTestId('insured-name-input');
  }
  get insuredDobInput() {
    return this.page.getByTestId('insured-dob-input');
  }
  get nomineeNameInput() {
    return this.page.getByTestId('nominee-name-input');
  }
  get nomineeRelationshipSelect() {
    return this.page.getByTestId('nominee-relationship-select');
  }
  get declarationCheckbox() {
    return this.page.getByTestId('insurance-declaration-checkbox');
  }
  get confirmPurchaseButton() {
    return this.page.getByRole('button', { name: 'Confirm Policy Purchase' });
  }
  // Confirmed via DevTools: page-level error summary, same pattern as investment/redemption
  // forms — <div class="alert alert-error" data-testid="form-error-summary">
  get validationError() {
    return this.page.getByTestId('form-error-summary');
  }
  // Confirmed via DevTools: <section class="confirmation-card" data-testid="policy-confirmation-message">
  get purchaseConfirmationBanner() {
    return this.page.getByTestId('policy-confirmation-message');
  }

  async fillPersonalDetails(name, dob) {
    await this.insuredNameInput.fill(name);
    // dob expected as 'YYYY-MM-DD' to match the native <input type="date">.
    await this.insuredDobInput.fill(dob);
  }

  async fillNominee(name, relationship) {
    await this.nomineeNameInput.fill(name);
    if (relationship) {
      await this.nomineeRelationshipSelect.selectOption({ label: relationship });
    }
  }

  async confirmPurchase() {
    // Declaration checkbox is mandatory on the real form. Auto-check it here unless a test is
    // specifically exercising the missing-declaration case, so field-focused negative tests
    // isolate to the field they're actually testing instead of tripping this one too.
    const isChecked = await this.declarationCheckbox.isChecked();
    if (!isChecked) {
      await this.declarationCheckbox.check();
    }
    await this.confirmPurchaseButton.click();
  }

  async confirmPurchaseWithoutDeclaration() {
    await this.confirmPurchaseButton.click();
  }

  async expectValidationError(pattern) {
    await expect(this.validationError).toBeVisible();
    if (pattern) await expect(this.validationError).toHaveText(pattern);
  }

  async expectPurchaseConfirmed() {
    await expect(this.purchaseConfirmationBanner).toBeVisible();
  }
}

module.exports = { InsurancePage };