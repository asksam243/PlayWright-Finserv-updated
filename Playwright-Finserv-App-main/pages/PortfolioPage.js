const { expect } = require('@playwright/test');
const { routes } = require('../fixtures/testData');

class PortfolioPage {
  constructor(page) {
    this.page = page;
    // Confirmed via DevTools: <tr data-testid="holding-row-{N}"> where N is a numeric row id.
    this.holdingsRows = page.locator('[data-testid^="holding-row-"]');
    // Confirmed via DevTools: <div class="summary-metric-value" data-testid="portfolio-total">
    this.totalValue = page.getByTestId('portfolio-total');
    // Confirmed via DevTools: <div class="card" data-testid="portfolio-empty-state">
    this.emptyState = page.getByTestId('portfolio-empty-state');
    this.statementDownloadButton = page.getByRole('button', { name: /download statement/i });
    this.assetAllocationChart = page.locator('[data-testid="asset-allocation"]');
  }

  async goto() {
    await this.page.goto(routes.portfolio);
  }

  async expectHoldingCount(min) {
    expect(await this.holdingsRows.count()).toBeGreaterThanOrEqual(min);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async getTotalValueText() {
    return (await this.totalValue.innerText()).trim();
  }

  // NOTE: confirmed via DevTools that there is no separate holding-detail page/route in the
  // real app — current value and gain/loss are shown directly in each holdings-table row.
  // "Redeem" is the only per-row navigation action (goes to /redeem/{id}), so these helpers
  // read values from the row itself instead of navigating to a nonexistent detail page.
  async getFirstHoldingCurrentValueText() {
    const currentValueCell = this.holdingsRows.first().locator('[data-testid^="holding-current-value-"]');
    return (await currentValueCell.innerText()).trim();
  }

  async getFirstHoldingGainLossText() {
    // Gain/loss cell has no data-testid — identified by its success/danger styling class.
    const gainLossCell = this.holdingsRows.first().locator('td.text-success, td.text-danger');
    return (await gainLossCell.innerText()).trim();
  }

  // Confirmed via DevTools: <a href=".../redeem/1" data-testid="redeem-button-1">Redeem</a>
  // This is the real (and only) navigation path from a holding row — there's no separate
  // detail page to click into first.
  async clickRedeemForFirstHolding() {
    await this.holdingsRows.first().locator('[data-testid^="redeem-button-"]').click();
  }

  // IMPORTANT: confirmed via DevTools that some holding rows show 0 available units (already
  // fully redeemed) despite still appearing in the table — e.g. FOL-ARJ-001 in the seeded data.
  // Redemption tests need a holding that actually has a balance, so this scans rows for the
  // first one whose current-value cell is greater than zero, rather than assuming the first
  // row in the table has anything left to redeem.
  async clickRedeemForFirstNonZeroHolding() {
    const count = await this.holdingsRows.count();
    for (let i = 0; i < count; i++) {
      const row = this.holdingsRows.nth(i);
      const currentValueText = await row.locator('[data-testid^="holding-current-value-"]').innerText();
      const value = parseFloat(currentValueText.replace(/[^0-9.]/g, ''));
      if (value > 0) {
        await row.locator('[data-testid^="redeem-button-"]').click();
        return;
      }
    }
    throw new Error('No holding with a positive current value was found to redeem.');
  }
}

module.exports = { PortfolioPage };