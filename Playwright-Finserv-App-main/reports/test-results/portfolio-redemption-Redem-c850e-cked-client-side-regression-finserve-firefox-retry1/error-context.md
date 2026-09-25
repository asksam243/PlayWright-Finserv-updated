# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio\redemption.spec.js >> Redemption Flow @portfolio >> zero-amount redemption is blocked client-side @regression
- Location: tests\portfolio\redemption.spec.js:32:3

# Error details

```
Error: No holding with a positive current value was found to redeem.
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
  2  | const { routes } = require('../fixtures/testData');
  3  | 
  4  | class PortfolioPage {
  5  |   constructor(page) {
  6  |     this.page = page;
  7  |     // Confirmed via DevTools: <tr data-testid="holding-row-{N}"> where N is a numeric row id.
  8  |     this.holdingsRows = page.locator('[data-testid^="holding-row-"]');
  9  |     // Confirmed via DevTools: <div class="summary-metric-value" data-testid="portfolio-total">
  10 |     this.totalValue = page.getByTestId('portfolio-total');
  11 |     // Confirmed via DevTools: <div class="card" data-testid="portfolio-empty-state">
  12 |     this.emptyState = page.getByTestId('portfolio-empty-state');
  13 |     this.statementDownloadButton = page.getByRole('button', { name: /download statement/i });
  14 |     this.assetAllocationChart = page.locator('[data-testid="asset-allocation"]');
  15 |   }
  16 | 
  17 |   async goto() {
  18 |     await this.page.goto(routes.portfolio);
  19 |   }
  20 | 
  21 |   async expectHoldingCount(min) {
  22 |     expect(await this.holdingsRows.count()).toBeGreaterThanOrEqual(min);
  23 |   }
  24 | 
  25 |   async expectEmptyState() {
  26 |     await expect(this.emptyState).toBeVisible();
  27 |   }
  28 | 
  29 |   async getTotalValueText() {
  30 |     return (await this.totalValue.innerText()).trim();
  31 |   }
  32 | 
  33 |   // NOTE: confirmed via DevTools that there is no separate holding-detail page/route in the
  34 |   // real app — current value and gain/loss are shown directly in each holdings-table row.
  35 |   // "Redeem" is the only per-row navigation action (goes to /redeem/{id}), so these helpers
  36 |   // read values from the row itself instead of navigating to a nonexistent detail page.
  37 |   async getFirstHoldingCurrentValueText() {
  38 |     const currentValueCell = this.holdingsRows.first().locator('[data-testid^="holding-current-value-"]');
  39 |     return (await currentValueCell.innerText()).trim();
  40 |   }
  41 | 
  42 |   async getFirstHoldingGainLossText() {
  43 |     // Gain/loss cell has no data-testid — identified by its success/danger styling class.
  44 |     const gainLossCell = this.holdingsRows.first().locator('td.text-success, td.text-danger');
  45 |     return (await gainLossCell.innerText()).trim();
  46 |   }
  47 | 
  48 |   // Confirmed via DevTools: <a href=".../redeem/1" data-testid="redeem-button-1">Redeem</a>
  49 |   // This is the real (and only) navigation path from a holding row — there's no separate
  50 |   // detail page to click into first.
  51 |   async clickRedeemForFirstHolding() {
  52 |     await this.holdingsRows.first().locator('[data-testid^="redeem-button-"]').click();
  53 |   }
  54 | 
  55 |   // IMPORTANT: confirmed via DevTools that some holding rows show 0 available units (already
  56 |   // fully redeemed) despite still appearing in the table — e.g. FOL-ARJ-001 in the seeded data.
  57 |   // Redemption tests need a holding that actually has a balance, so this scans rows for the
  58 |   // first one whose current-value cell is greater than zero, rather than assuming the first
  59 |   // row in the table has anything left to redeem.
  60 |   async clickRedeemForFirstNonZeroHolding() {
  61 |     const count = await this.holdingsRows.count();
  62 |     for (let i = 0; i < count; i++) {
  63 |       const row = this.holdingsRows.nth(i);
  64 |       const currentValueText = await row.locator('[data-testid^="holding-current-value-"]').innerText();
  65 |       const value = parseFloat(currentValueText.replace(/[^0-9.]/g, ''));
  66 |       if (value > 0) {
  67 |         await row.locator('[data-testid^="redeem-button-"]').click();
  68 |         return;
  69 |       }
  70 |     }
> 71 |     throw new Error('No holding with a positive current value was found to redeem.');
     |           ^ Error: No holding with a positive current value was found to redeem.
  72 |   }
  73 | }
  74 | 
  75 | module.exports = { PortfolioPage };
```