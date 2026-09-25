const { test, expect } = require('../../fixtures/auth.fixture');
const { DashboardPage } = require('../../pages/DashboardPage');
const { PortfolioPage } = require('../../pages/PortfolioPage');

test.describe('Dashboard @dashboard', () => {
  test('dashboard loads portfolio and policy summary for an existing user @smoke', async ({ qaUserPage }) => {
    const dashboard = new DashboardPage(qaUserPage);
    await dashboard.goto();
    await dashboard.expectLoaded();
    await expect(dashboard.portfolioValue).toBeVisible();
  });

  test('dashboard shows an empty state for a brand-new user with no holdings @regression', async ({ newUserPage }) => {
    const dashboard = new DashboardPage(newUserPage);
    await dashboard.goto();
    // A new seeded user should not show a populated recent-transactions list.
    const count = await dashboard.getRecentTransactionCount();
    expect(count).toBe(0);
  });

  test('navigating from dashboard cards routes to the correct module @regression', async ({ qaUserPage }) => {
    const dashboard = new DashboardPage(qaUserPage);
    await dashboard.goto();
    await dashboard.navigateToPortfolio();
    await qaUserPage.goBack();
    await dashboard.navigateToInsurance();
  });

  test('portfolio value on dashboard reconciles with portfolio page total @regression', async ({ qaUserPage }) => {
    const dashboard = new DashboardPage(qaUserPage);
    await dashboard.goto();
    const dashboardValue = await dashboard.getPortfolioValueText();

    await dashboard.navigateToPortfolio();
    const portfolio = new PortfolioPage(qaUserPage);
    await expect(portfolio.totalValue).toHaveText(dashboardValue);
  });
});
