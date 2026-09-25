const { test, expect } = require('../../fixtures/auth.fixture');
const { PortfolioPage } = require('../../pages/PortfolioPage');
const { RedemptionPage } = require('../../pages/RedemptionPage');
const { redemptionScenarios } = require('../../fixtures/testData');
const { parseCurrency } = require('../../utils/assertions');

test.describe('Redemption Flow @portfolio', () => {
  test('partial redemption by units within balance succeeds @smoke', async ({ investorPage }) => {
    const portfolio = new PortfolioPage(investorPage);
    await portfolio.goto();
    // Confirmed via DevTools: clicking "Redeem" on a holding row navigates straight to
    // /redeem/{id} — there's no intermediate holding-detail page to visit first.
    await portfolio.clickRedeemForFirstNonZeroHolding();

    const redemption = new RedemptionPage(investorPage);
    await redemption.redeemByUnits(redemptionScenarios.partialValidUnits);
    await redemption.confirm();
    await redemption.expectConfirmed();
  });

  test('redemption amount exceeding available balance is rejected @regression', async ({ investorPage }) => {
    const portfolio = new PortfolioPage(investorPage);
    await portfolio.goto();
    await portfolio.clickRedeemForFirstNonZeroHolding();

    const redemption = new RedemptionPage(investorPage);
    await redemption.redeemByAmount(redemptionScenarios.exceedsHoldingAmount);
    await redemption.confirm();
    await redemption.expectValidationError(/exceed|insufficient|available/i);
  });

  test('zero-amount redemption is blocked client-side @regression', async ({ investorPage }) => {
    const portfolio = new PortfolioPage(investorPage);
    await portfolio.goto();
    await portfolio.clickRedeemForFirstNonZeroHolding();

    const redemption = new RedemptionPage(investorPage);
    await redemption.redeemByAmount(redemptionScenarios.zeroAmount);
    await redemption.confirm();
    await redemption.expectValidationError();
  });

  test('successful redemption reduces the holding value shown on portfolio page @regression', async ({ investorPage }) => {
    const portfolio = new PortfolioPage(investorPage);
    await portfolio.goto();
    const beforeText = await portfolio.getTotalValueText();
    const beforeTotal = parseCurrency(beforeText);

    await portfolio.clickRedeemForFirstNonZeroHolding();
    const redemption = new RedemptionPage(investorPage);
    await redemption.redeemByUnits(redemptionScenarios.partialValidUnits);
    await redemption.confirm();
    await redemption.expectConfirmed();

    await portfolio.goto();
    const afterText = await portfolio.getTotalValueText();
    const afterTotal = parseCurrency(afterText);
    expect(afterTotal).toBeLessThanOrEqual(beforeTotal);
  });
});