# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: transactions\transactions.spec.js >> Transaction History @transactions >> filtering by Failed status returns only matching rows @regression
- Location: tests\transactions\transactions.spec.js:46:3

# Error details

```
Error: expect(received).toMatch(expected)

Expected pattern: /Failed/i
Received string:  "
                                SUCCESS
                            "
```

# Page snapshot

```yaml
- generic [ref=f3e2]:
  - banner [ref=f3e3]:
    - link "FS FinServe Retail" [ref=f3e4] [cursor=pointer]:
      - /url: http://localhost:8082/dashboard
      - generic [ref=f3e5]: FS
      - generic [ref=f3e6]: FinServe Retail
    - navigation "Main navigation" [ref=f3e7]:
      - link "Dashboard" [ref=f3e8] [cursor=pointer]:
        - /url: http://localhost:8082/dashboard
      - link "Mutual Funds" [ref=f3e9] [cursor=pointer]:
        - /url: http://localhost:8082/mutual-funds
      - link "Portfolio" [ref=f3e10] [cursor=pointer]:
        - /url: http://localhost:8082/portfolio
      - link "Insurance" [ref=f3e11] [cursor=pointer]:
        - /url: http://localhost:8082/insurance
      - link "Policies" [ref=f3e12] [cursor=pointer]:
        - /url: http://localhost:8082/policies
      - link "Transactions" [ref=f3e13] [cursor=pointer]:
        - /url: http://localhost:8082/transactions
      - link "Support" [ref=f3e14] [cursor=pointer]:
        - /url: http://localhost:8082/support
      - link "Profile" [ref=f3e15] [cursor=pointer]:
        - /url: http://localhost:8082/profile
    - generic [ref=f3e16]:
      - generic [ref=f3e17]: Arjun Mehta
      - button "Logout" [ref=f3e19] [cursor=pointer]
  - main [ref=f3e20]:
    - generic [ref=f3e22]:
      - paragraph [ref=f3e23]: Transaction History
      - heading "Transactions" [level=1] [ref=f3e24]
      - paragraph [ref=f3e25]: Search and filter your investment, redemption, premium, refund, and failed payment transactions.
    - generic [ref=f3e27]:
      - generic [ref=f3e28]:
        - generic [ref=f3e29]: Search
        - textbox "Search" [ref=f3e30]:
          - /placeholder: Reference or product name
      - generic [ref=f3e31]:
        - generic [ref=f3e32]: Type
        - combobox "Type" [ref=f3e33]:
          - option "All Types" [selected]
          - option "Investment"
          - option "Redemption"
          - option "Premium Payment"
          - option "Refund"
          - option "Failed Payment"
      - generic [ref=f3e34]:
        - generic [ref=f3e35]: Status
        - combobox "Status" [ref=f3e36]:
          - option "All Statuses"
          - option "SUCCESS"
          - option "PENDING"
          - option "FAILED" [selected]
          - option "CANCELLED"
      - generic [ref=f3e37]:
        - generic [ref=f3e38]: From
        - textbox "From" [ref=f3e39]
      - generic [ref=f3e40]:
        - generic [ref=f3e41]: To
        - textbox "To" [ref=f3e42]
      - generic [ref=f3e43]:
        - button "Apply Filters" [ref=f3e44] [cursor=pointer]
        - link "Reset" [ref=f3e45] [cursor=pointer]:
          - /url: http://localhost:8082/transactions
    - table [ref=f3e48]:
      - rowgroup [ref=f3e49]:
        - row [ref=f3e50]:
          - columnheader "Reference" [ref=f3e51]
          - columnheader "Date" [ref=f3e52]
          - columnheader "Type" [ref=f3e53]
          - columnheader "Product" [ref=f3e54]
          - columnheader "Amount" [ref=f3e55]
          - columnheader "Status" [ref=f3e56]
          - columnheader "Action" [ref=f3e57]
      - rowgroup [ref=f3e58]:
        - row [ref=f3e59]:
          - cell "TXN-ARJ-FAIL-001" [ref=f3e60]
          - cell "16 May 2026" [ref=f3e61]
          - cell "Failed Payment" [ref=f3e62]
          - cell "FinServe Bluechip Equity Fund" [ref=f3e63]
          - cell "₹9,999.00" [ref=f3e64]
          - cell "SUCCESS" [ref=f3e65]
          - cell [ref=f3e66]:
            - link "View" [ref=f3e67] [cursor=pointer]:
              - /url: http://localhost:8082/transactions/3
  - contentinfo [ref=f3e68]: FinServe Retail Demo Platform · Built for Playwright QA Automation Practice
```

# Test source

```ts
  1  | const { test, expect } = require('../../fixtures/auth.fixture');
  2  | const { TransactionPage } = require('../../pages/TransactionPage');
  3  | const { MutualFundsPage } = require('../../pages/MutualFundsPage');
  4  | const { FundDetailsPage } = require('../../pages/FundDetailsPage');
  5  | const { InvestmentPage } = require('../../pages/InvestmentPage');
  6  | const { mutualFunds, investmentAmounts } = require('../../fixtures/testData');
  7  | 
  8  | test.describe('Transaction History @transactions', () => {
  9  |   test('transaction list shows history for an existing user @smoke', async ({ investorPage }) => {
  10 |     const transactions = new TransactionPage(investorPage);
  11 |     await transactions.goto();
  12 |     await transactions.expectRowCount(1);
  13 |   });
  14 | 
  15 |   test('a fresh investment appears in transaction history immediately (no stale cache) @regression', async ({ qaUserPage }) => {
  16 |     const fundsPage = new MutualFundsPage(qaUserPage);
  17 |     const detailsPage = new FundDetailsPage(qaUserPage);
  18 |     const investPage = new InvestmentPage(qaUserPage);
  19 | 
  20 |     await fundsPage.goto();
  21 |     await fundsPage.openFundById(mutualFunds.confirmedSample.fundCode);
  22 |     await detailsPage.clickInvest();
  23 |     await investPage.selectLumpsum();
  24 |     await investPage.enterAmount(investmentAmounts.validLumpsum);
  25 |     await investPage.acceptDeclaration();
  26 |     await investPage.confirmInvestment();
  27 |     await investPage.expectConfirmed();
  28 |     const txnId = await investPage.getTransactionId();
  29 | 
  30 |     const transactions = new TransactionPage(qaUserPage);
  31 |     await transactions.goto();
  32 |     await transactions.expectTransactionVisible(txnId);
  33 |   });
  34 | 
  35 |   test('filtering by transaction type returns only matching rows @regression', async ({ investorPage }) => {
  36 |     const transactions = new TransactionPage(investorPage);
  37 |     await transactions.goto();
  38 |     await transactions.filterByType('Redemption');
  39 |     const typeLabels = await transactions.getAllVisibleTypeLabels();
  40 |     expect(typeLabels.length).toBeGreaterThan(0);
  41 |     for (const label of typeLabels) {
  42 |       expect(label).toMatch(/redemption/i);
  43 |     }
  44 |   });
  45 | 
  46 |   test('filtering by Failed status returns only matching rows @regression', async ({ investorPage }) => {
  47 |     const transactions = new TransactionPage(investorPage);
  48 |     await transactions.goto();
  49 |     await transactions.filterByStatus('FAILED');
  50 |     const statusLabels = await transactions.getAllVisibleStatusLabels();
  51 |     expect(statusLabels.length).toBeGreaterThan(0);
  52 |     for (const label of statusLabels) {
> 53 |       expect(label).toMatch(/Failed/i);
     |                     ^ Error: expect(received).toMatch(expected)
  54 |     }
  55 |   });
  56 | 
  57 |   test('user with no activity sees an empty transaction history state @regression', async ({ newUserPage }) => {
  58 |     const transactions = new TransactionPage(newUserPage);
  59 |     await transactions.goto();
  60 |     await transactions.expectEmptyState();
  61 |   });
  62 | });
  63 | 
```