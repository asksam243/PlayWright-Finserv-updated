# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mutual-funds\investment.spec.js >> Mutual Fund Investment @mutual-funds >> SIP investment below minimum is rejected with a clear validation message @regression
- Location: tests\mutual-funds\investment.spec.js:26:3

# Error details

```
TimeoutError: locator.click: Timeout 20000ms exceeded.
Call log:
  - waiting for getByTestId('invest-now-button')

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
  1  | const { expect } = require('@playwright/test');
  2  | 
  3  | class FundDetailsPage {
  4  |   constructor(page) {
  5  |     this.page = page;
  6  |     // Confirmed via DevTools: <div class="page-header" data-testid="fund-details-page">
  7  |     this.pageHeader = page.getByTestId('fund-details-page');
  8  |     // Confirmed via DevTools: <h1 data-testid="fund-detail-name">
  9  |     this.fundName = page.getByTestId('fund-detail-name');
  10 |     // Confirmed pattern: <div class="metric-card"><span class="metric-label">3-Year Return</span>
  11 |     // <strong>8.70%</strong></div> — no data-testid on the value itself, so filter by label text.
  12 |     this.navValue = page.locator('.metric-card').filter({ hasText: 'NAV' }).locator('strong');
  13 |     this.returns1Y = page.locator('.metric-card').filter({ hasText: '1-Year Return' }).locator('strong');
  14 |     this.returns3Y = page.locator('.metric-card').filter({ hasText: '3-Year Return' }).locator('strong');
  15 |     this.expenseRatio = page.locator('.metric-card').filter({ hasText: 'Expense Ratio' }).locator('strong');
  16 |     // Confirmed via DevTools: <span data-testid="fund-detail-minimum-sip">₹500</span>
  17 |     this.minimumSip = page.getByTestId('fund-detail-minimum-sip');
  18 |     this.minimumLumpsum = page.getByTestId('fund-detail-minimum-lumpsum');
  19 |     // Confirmed via DevTools: <p class="muted">FSBAL007 · Hybrid Fund · Moderate Risk</p>
  20 |     // Risk level and category are NOT separate elements — they're both part of this one
  21 |     // combined subtitle paragraph. toHaveText() with a regex does a substring match, so
  22 |     // pointing both riskLevel and category at the same locator still works correctly.
  23 |     this.riskLevel = page.getByTestId('fund-details-page').locator('p.muted');
  24 |     this.category = page.getByTestId('fund-details-page').locator('p.muted');
  25 |     // Confirmed via DevTools: <a class="btn btn-primary" data-testid="invest-now-button">Invest Now</a>
  26 |     // Note: this is a link, not a <button>.
  27 |     this.investButton = page.getByTestId('invest-now-button');
  28 |     this.compareButton = page.getByRole('button', { name: /compare/i });
  29 |   }
  30 | 
  31 |   async expectLoaded(expectedName) {
  32 |     await expect(this.fundName).toHaveText(new RegExp(expectedName, 'i'));
  33 |   }
  34 | 
  35 |   async getNav() {
  36 |     return (await this.navValue.innerText()).trim();
  37 |   }
  38 | 
  39 |   async clickInvest() {
> 40 |     await this.investButton.click();
     |                             ^ TimeoutError: locator.click: Timeout 20000ms exceeded.
  41 |     await expect(this.page).toHaveURL(/invest/);
  42 |   }
  43 | }
  44 | 
  45 | module.exports = { FundDetailsPage };
```