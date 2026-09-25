# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mutual-funds\mutual-funds.spec.js >> Mutual Fund Discovery @mutual-funds >> filtering by risk level narrows results consistently @regression
- Location: tests\mutual-funds\mutual-funds.spec.js:21:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e4]:
    - heading "500" [level=1] [ref=e5]
    - generic [ref=e6]: Server Error
```

# Test source

```ts
  1  | const { test, expect } = require('../../fixtures/auth.fixture');
  2  | const { MutualFundsPage } = require('../../pages/MutualFundsPage');
  3  | const { FundDetailsPage } = require('../../pages/FundDetailsPage');
  4  | const { mutualFunds } = require('../../fixtures/testData');
  5  | 
  6  | test.describe('Mutual Fund Discovery @mutual-funds', () => {
  7  |   test('search returns matching funds @smoke', async ({ qaUserPage }) => {
  8  |     const fundsPage = new MutualFundsPage(qaUserPage);
  9  |     await fundsPage.goto();
  10 |     await fundsPage.searchFund(mutualFunds.confirmedSample.fundName);
  11 |     await fundsPage.expectResultsContain(mutualFunds.confirmedSample.fundName);
  12 |   });
  13 | 
  14 |   test('search with a nonsense term returns no results, not an error page @regression', async ({ qaUserPage }) => {
  15 |     const fundsPage = new MutualFundsPage(qaUserPage);
  16 |     await fundsPage.goto();
  17 |     await fundsPage.searchFund('zzzzznonexistentfundzzzz');
  18 |     await fundsPage.expectNoResults();
  19 |   });
  20 | 
  21 |   test('filtering by risk level narrows results consistently @regression', async ({ qaUserPage }) => {
  22 |     const fundsPage = new MutualFundsPage(qaUserPage);
  23 |     await fundsPage.goto();
  24 |     await fundsPage.filterByRisk('High');
  25 |     const count = await fundsPage.getFundRowCount();
> 26 |     expect(count).toBeGreaterThan(0);
     |                   ^ Error: expect(received).toBeGreaterThan(expected)
  27 |   });
  28 | 
  29 |   test('fund detail page shows NAV, returns, risk, and category @smoke', async ({ qaUserPage }) => {
  30 |     const fundsPage = new MutualFundsPage(qaUserPage);
  31 |     const detailsPage = new FundDetailsPage(qaUserPage);
  32 |     await fundsPage.goto();
  33 |     await fundsPage.openFundById(mutualFunds.confirmedSample.fundCode);
  34 |     await detailsPage.expectLoaded(mutualFunds.confirmedSample.fundName);
  35 |     await expect(detailsPage.navValue).toBeVisible();
  36 |     await expect(detailsPage.riskLevel).toHaveText(new RegExp(mutualFunds.confirmedSample.riskLevel, 'i'));
  37 |   });
  38 | 
  39 |   
  40 | });
  41 | 
```