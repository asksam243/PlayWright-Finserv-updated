const { expect } = require('@playwright/test');

class FundDetailsPage {
  constructor(page) {
    this.page = page;
    // Confirmed via DevTools: <div class="page-header" data-testid="fund-details-page">
    this.pageHeader = page.getByTestId('fund-details-page');
    // Confirmed via DevTools: <h1 data-testid="fund-detail-name">
    this.fundName = page.getByTestId('fund-detail-name');
    // Confirmed pattern: <div class="metric-card"><span class="metric-label">3-Year Return</span>
    // <strong>8.70%</strong></div> — no data-testid on the value itself, so filter by label text.
    this.navValue = page.locator('.metric-card').filter({ hasText: 'NAV' }).locator('strong');
    this.returns1Y = page.locator('.metric-card').filter({ hasText: '1-Year Return' }).locator('strong');
    this.returns3Y = page.locator('.metric-card').filter({ hasText: '3-Year Return' }).locator('strong');
    this.expenseRatio = page.locator('.metric-card').filter({ hasText: 'Expense Ratio' }).locator('strong');
    // Confirmed via DevTools: <span data-testid="fund-detail-minimum-sip">₹500</span>
    this.minimumSip = page.getByTestId('fund-detail-minimum-sip');
    this.minimumLumpsum = page.getByTestId('fund-detail-minimum-lumpsum');
    // Confirmed via DevTools: <p class="muted">FSBAL007 · Hybrid Fund · Moderate Risk</p>
    // Risk level and category are NOT separate elements — they're both part of this one
    // combined subtitle paragraph. toHaveText() with a regex does a substring match, so
    // pointing both riskLevel and category at the same locator still works correctly.
    this.riskLevel = page.getByTestId('fund-details-page').locator('p.muted');
    this.category = page.getByTestId('fund-details-page').locator('p.muted');
    // Confirmed via DevTools: <a class="btn btn-primary" data-testid="invest-now-button">Invest Now</a>
    // Note: this is a link, not a <button>.
    this.investButton = page.getByTestId('invest-now-button');
    this.compareButton = page.getByRole('button', { name: /compare/i });
  }

  async expectLoaded(expectedName) {
    await expect(this.fundName).toHaveText(new RegExp(expectedName, 'i'));
  }

  async getNav() {
    return (await this.navValue.innerText()).trim();
  }

  async clickInvest() {
    await this.investButton.click();
    await expect(this.page).toHaveURL(/invest/);
  }
}

module.exports = { FundDetailsPage };