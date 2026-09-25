const { expect } = require('@playwright/test');
const { routes } = require('../fixtures/testData');

class MutualFundsPage {
  constructor(page) {
    this.page = page;
    // All confirmed via DevTools inspection of the real /mutual-funds page.
    this.searchInput = page.getByTestId('fund-search-input');
    this.categoryFilter = page.getByTestId('fund-category-filter');
    this.riskFilter = page.getByTestId('fund-risk-filter');
    this.sortDropdown = page.getByTestId('fund-sort-select');
    this.applyButton = page.getByTestId('fund-filter-submit');
    this.resetButton = page.getByTestId('fund-filter-reset');
    // Fund cards: <article class="product-card" data-testid="fund-card-{FUND_CODE}">
    this.fundRows = page.locator('[data-testid^="fund-card-"]');
    // NOT YET CONFIRMED — haven't triggered a genuinely empty result set yet to see this state.
    this.noResultsMessage = page.getByTestId('funds-empty-state');
    // NOT CONFIRMED / LIKELY DOESN'T EXIST — no watchlist button visible on product cards in
    // the real app (cards only show header, NAV/1Y-return/Min-SIP metrics, and a View Details link).
    this.watchlistButtons = page.locator('[data-testid="watchlist-toggle"]');
  }

  async goto() {
    await this.page.goto(routes.mutualFunds);
  }

  async searchFund(term) {
    await this.searchInput.fill(term);
    // Confirmed: this is a real <form> submitted via the "Apply" button, not live/instant search.
    await this.applyButton.click();
  }

  async filterByRisk(risk) {
    await this.riskFilter.selectOption({ label: risk });
    await this.applyButton.click();
  }

  async sortBy(option) {
    await this.sortDropdown.selectOption({ label: option });
    await this.applyButton.click();
  }

  async openFundByName(fundName) {
    await this.page.getByRole('heading', { name: fundName }).click();
  }

  async openFundById(fundCode) {
    // Confirmed: the View Details link's data-testid follows "fund-details-link-{FUND_CODE}",
    // even though its actual href navigates to a numeric ID (e.g. /mutual-funds/7). Clicking the
    // link avoids needing to know/guess that numeric ID ourselves.
    await this.page.getByTestId(`fund-details-link-${fundCode}`).click();
  }

  async expectResultsContain(fundName) {
    await expect(this.fundRows.filter({ hasText: fundName }).first()).toBeVisible();
  }

  async expectNoResults() {
    await expect(this.noResultsMessage).toBeVisible();
  }

  async addFirstResultToWatchlist() {
    await this.watchlistButtons.first().click();
  }

  async getFundRowCount() {
    return this.fundRows.count();
  }
}

module.exports = { MutualFundsPage };