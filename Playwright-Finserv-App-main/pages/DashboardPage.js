const { expect } = require('@playwright/test');
const { routes } = require('../fixtures/testData');


class DashboardPage {
  constructor(page) {
    this.page = page;
    this.portfolioSummary = page.getByTestId('dashboard-page');
    this.portfolioValue = page.getByTestId('portfolio-total-value');
    this.recentTransactionsList = page.locator('[data-testid^="transaction-row-"]');
    this.policySummary = page.locator('.stat-card').filter({ hasText: 'Active Policies' });
    this.investCard = page.getByRole('link', { name: 'Mutual Funds' });
    this.myPortfolioCard = page.getByRole('link', { name: 'Portfolio' });
    this.insuranceCard = page.getByRole('link', { name: 'Insurance' });
    this.emptyStateMessage = page.locator('[data-testid="empty-state"]');
  }

  async goto() {
    await this.page.goto(routes.dashboard);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.portfolioSummary).toBeVisible();
  }

  async getPortfolioValueText() {
    return (await this.portfolioValue.innerText()).trim();
  }

  async getRecentTransactionCount() {
    return this.recentTransactionsList.count();
  }

  async navigateToPortfolio() {
    await this.myPortfolioCard.click();
    await expect(this.page).toHaveURL(/portfolio/);
  }

  async navigateToInsurance() {
    await this.insuranceCard.click();
    await expect(this.page).toHaveURL(/insurance/);
  }

  async navigateToInvest() {
    await this.investCard.click();
    await expect(this.page).toHaveURL(/mutual-funds|invest/);
  }
}

module.exports = { DashboardPage };
