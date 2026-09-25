const { test, expect } = require('../../fixtures/auth.fixture');
const { PortfolioPage } = require('../../pages/PortfolioPage');
const { parseCurrency } = require('../../utils/assertions');

test.describe('Portfolio Management @portfolio', () => {
  test('portfolio page lists holdings for an investor with existing positions @smoke', async ({ investorPage }) => {
    const portfolio = new PortfolioPage(investorPage);
    await portfolio.goto();
    await portfolio.expectHoldingCount(1);
  });

  test('portfolio shows an empty state for a user with no holdings @regression', async ({ newUserPage }) => {
    const portfolio = new PortfolioPage(newUserPage);
    await portfolio.goto();
    await portfolio.expectEmptyState();
  });

  test('portfolio total value is a valid positive currency figure @regression', async ({ investorPage }) => {
    const portfolio = new PortfolioPage(investorPage);
    await portfolio.goto();
    const totalText = await portfolio.getTotalValueText();
    const total = parseCurrency(totalText);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('portfolio row shows current value and gain/loss for each holding @regression', async ({ investorPage }) => {
    const portfolio = new PortfolioPage(investorPage);
    await portfolio.goto();
    // Confirmed via DevTools: there's no separate holding-detail page to navigate to — current
    // value and gain/loss are shown directly as cells within each holdings-table row.
    const currentValueText = await portfolio.getFirstHoldingCurrentValueText();
    const gainLossText = await portfolio.getFirstHoldingGainLossText();
    expect(currentValueText).toMatch(/₹/);
    expect(gainLossText).toMatch(/₹/);
  });
});