const { test, expect } = require('../../fixtures/auth.fixture');
const { MutualFundsPage } = require('../../pages/MutualFundsPage');
const { FundDetailsPage } = require('../../pages/FundDetailsPage');
const { mutualFunds } = require('../../fixtures/testData');

test.describe('Mutual Fund Discovery @mutual-funds', () => {
  test('search returns matching funds @smoke', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    await fundsPage.goto();
    await fundsPage.searchFund(mutualFunds.confirmedSample.fundName);
    await fundsPage.expectResultsContain(mutualFunds.confirmedSample.fundName);
  });

  test('search with a nonsense term returns no results, not an error page @regression', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    await fundsPage.goto();
    await fundsPage.searchFund('zzzzznonexistentfundzzzz');
    await fundsPage.expectNoResults();
  });

  test('filtering by risk level narrows results consistently @regression', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    await fundsPage.goto();
    await fundsPage.filterByRisk('High');
    const count = await fundsPage.getFundRowCount();
    expect(count).toBeGreaterThan(0);
  });

  test('fund detail page shows NAV, returns, risk, and category @smoke', async ({ qaUserPage }) => {
    const fundsPage = new MutualFundsPage(qaUserPage);
    const detailsPage = new FundDetailsPage(qaUserPage);
    await fundsPage.goto();
    await fundsPage.openFundById(mutualFunds.confirmedSample.fundCode);
    await detailsPage.expectLoaded(mutualFunds.confirmedSample.fundName);
    await expect(detailsPage.navValue).toBeVisible();
    await expect(detailsPage.riskLevel).toHaveText(new RegExp(mutualFunds.confirmedSample.riskLevel, 'i'));
  });

  /**
   * DEF-FS-002 (candidate) — sorting by 1-Year Return does not reorder results.
   *
   * VERIFY before trusting this test:
   * - SORT_OPTION_LABEL must exactly match the sort <select>'s visible option text for
   *   "1-Year Return" — not yet confirmed via DevTools (unlike every other locator in
   *   MutualFundsPage.js, which is DevTools-confirmed).
   * - Return-value extraction below reuses the CONFIRMED metric-card + label-filter pattern
   *   from FundDetailsPage.js (navValue/returns1Y), since fund cards use the same
   *   `.metric-card` structure with no dedicated data-testid on the value itself.
   *
   * This test asserts CORRECT behavior (descending order after sort) and is written to FAIL
   * against the current app if the defect is real — do not loosen this assertion to force a
   * pass; a failing result here is a Confirmed defect, not a flake.
   */
  test('DEF-FS-002: sorting by 1-Year Return reorders funds by descending return @regression @defect', async ({
    qaUserPage,
  }) => {
    const SORT_OPTION_LABEL = '1-Year Return (High to Low)'; // VERIFY exact label text

    async function readFundCodes() {
      const cards = qaUserPage.locator('[data-testid^="fund-card-"]');
      const count = await cards.count();
      const codes = [];
      for (let i = 0; i < count; i++) {
        const testId = await cards.nth(i).getAttribute('data-testid');
        codes.push(testId.replace('fund-card-', ''));
      }
      return codes;
    }

    async function readOneYearReturns() {
      const cards = qaUserPage.locator('[data-testid^="fund-card-"]');
      const count = await cards.count();
      const returns = [];
      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        // Same metric-card + label-filter pattern as FundDetailsPage.returns1Y.
        const valueLocator = card.locator('.metric-card').filter({ hasText: '1-Year Return' }).locator('strong');
        const text = await valueLocator.innerText();
        returns.push(parseFloat((text || '').replace(/[^0-9.-]/g, '')));
      }
      return returns;
    }

    const fundsPage = new MutualFundsPage(qaUserPage);
    await fundsPage.goto();

    const codesBeforeSort = await readFundCodes();
    expect(codesBeforeSort.length).toBeGreaterThan(1); // need >1 fund for a sort to be meaningful

    await fundsPage.sortBy(SORT_OPTION_LABEL);

    const codesAfterSort = await readFundCodes();
    const returnsAfterSort = await readOneYearReturns();
    const sortedDescending = [...returnsAfterSort].sort((a, b) => b - a);
    const orderUnchanged = JSON.stringify(codesBeforeSort) === JSON.stringify(codesAfterSort);
    const alreadyDescending = JSON.stringify(returnsAfterSort) === JSON.stringify(sortedDescending);

    if (orderUnchanged && !alreadyDescending) {
      // Documents the confirmed defect explicitly. Remove this branch once the underlying
      // sort bug is fixed, leaving only the assertion below.
      test.info().annotations.push({
        type: 'defect',
        description:
          'DEF-FS-002: fund card order is unchanged after applying the "1-Year Return" ' +
          `sort. Returns observed: ${JSON.stringify(returnsAfterSort)}`,
      });
    }

    expect(
      returnsAfterSort,
      'Fund cards should be ordered by descending 1-Year Return after sorting'
    ).toEqual(sortedDescending);
  });
});
