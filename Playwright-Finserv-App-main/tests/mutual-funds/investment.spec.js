const { test, expect } = require('../../fixtures/auth.fixture');
const { MutualFundsPage } = require('../../pages/MutualFundsPage');
const { FundDetailsPage } = require('../../pages/FundDetailsPage');
const { InvestmentPage } = require('../../pages/InvestmentPage');
const { mutualFunds, investmentAmounts } = require('../../fixtures/testData');

test.describe('Mutual Fund Investment @mutual-funds', () => {
  test('lumpsum investment above minimum completes successfully @smoke', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    const detailsPage = new FundDetailsPage(qaUserPage);
    const investPage = new InvestmentPage(qaUserPage);

    await fundsPage.goto();
    await fundsPage.openFundById(mutualFunds.confirmedSample.fundCode);
    await detailsPage.clickInvest();
    await investPage.selectLumpsum();
    await investPage.enterAmount(investmentAmounts.validLumpsum);
    await investPage.acceptDeclaration();
    await investPage.confirmInvestment();
    await investPage.expectConfirmed();

    const txnId = await investPage.getTransactionId();
    expect(txnId).toMatch(/TXN/i);
  });

  test('SIP investment below minimum is rejected with a clear validation message @regression', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    const detailsPage = new FundDetailsPage(qaUserPage);
    const investPage = new InvestmentPage(qaUserPage);

    await fundsPage.goto();
    await fundsPage.openFundById(mutualFunds.confirmedSample.fundCode);
    await detailsPage.clickInvest();
    await investPage.selectSip();
    await investPage.enterAmount(investmentAmounts.belowMinimum);
    await investPage.acceptDeclaration();
    await investPage.confirmInvestment();
    await investPage.expectValidationError(/minimum/i);
  });

  test('confirmation is not shown without accepting the mandatory declaration @regression', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    const detailsPage = new FundDetailsPage(qaUserPage);
    const investPage = new InvestmentPage(qaUserPage);

    await fundsPage.goto();
    await fundsPage.openFundById(mutualFunds.confirmedSample.fundCode);
    await detailsPage.clickInvest();
    await investPage.selectLumpsum();
    await investPage.enterAmount(investmentAmounts.validLumpsum);
    // Declaration intentionally skipped.
    await investPage.confirmInvestment();
    // Confirmed via DevTools: the app never redirects — URL stays at /invest/{id} whether the
    // submission succeeds or fails, since the confirmation panel renders inline. So checking
    // the URL (the original approach) doesn't actually test anything meaningful; check the
    // confirmation banner directly instead.
    await expect(investPage.confirmationBanner).not.toBeVisible();
  });

  test('boundary: investment exactly at documented minimum is accepted @regression', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    const detailsPage = new FundDetailsPage(qaUserPage);
    const investPage = new InvestmentPage(qaUserPage);

    await fundsPage.goto();
    await fundsPage.openFundById(mutualFunds.confirmedSample.fundCode);
    await detailsPage.clickInvest();
    await investPage.selectSip();
    await investPage.enterAmount(investmentAmounts.boundaryMinimum);
    await investPage.acceptDeclaration();
    await investPage.confirmInvestment();
    await investPage.expectConfirmed();
  });
});