const { test, expect } = require('../../fixtures/auth.fixture');
const { TransactionPage } = require('../../pages/TransactionPage');
const { MutualFundsPage } = require('../../pages/MutualFundsPage');
const { FundDetailsPage } = require('../../pages/FundDetailsPage');
const { InvestmentPage } = require('../../pages/InvestmentPage');
const { mutualFunds, investmentAmounts } = require('../../fixtures/testData');

test.describe('Transaction History @transactions', () => {
  test('transaction list shows history for an existing user @smoke', async ({ investorPage }) => {
    const transactions = new TransactionPage(investorPage);
    await transactions.goto();
    await transactions.expectRowCount(1);
  });

  test('a fresh investment appears in transaction history immediately (no stale cache) @regression', async ({ qaUserPage }) => {
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

    const transactions = new TransactionPage(qaUserPage);
    await transactions.goto();
    await transactions.expectTransactionVisible(txnId);
  });

  test('filtering by transaction type returns only matching rows @regression', async ({ investorPage }) => {
    const transactions = new TransactionPage(investorPage);
    await transactions.goto();
    await transactions.filterByType('Redemption');
    const typeLabels = await transactions.getAllVisibleTypeLabels();
    expect(typeLabels.length).toBeGreaterThan(0);
    for (const label of typeLabels) {
      expect(label).toMatch(/redemption/i);
    }
  });

  test('user with no activity sees an empty transaction history state @regression', async ({ newUserPage }) => {
    const transactions = new TransactionPage(newUserPage);
    await transactions.goto();
    await transactions.expectEmptyState();
  });
});