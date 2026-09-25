# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: insurance\insurance.spec.js >> Insurance Purchase @insurance >> future DOB blocks purchase @regression
- Location: tests\insurance\insurance.spec.js:41:4

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('form-error-summary')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByTestId('form-error-summary')

```

```yaml
- banner:
  - link "FS FinServe Retail":
    - /url: http://localhost:8082/dashboard
  - navigation "Main navigation":
    - link "Dashboard":
      - /url: http://localhost:8082/dashboard
    - link "Mutual Funds":
      - /url: http://localhost:8082/mutual-funds
    - link "Portfolio":
      - /url: http://localhost:8082/portfolio
    - link "Insurance":
      - /url: http://localhost:8082/insurance
    - link "Policies":
      - /url: http://localhost:8082/policies
    - link "Transactions":
      - /url: http://localhost:8082/transactions
    - link "Support":
      - /url: http://localhost:8082/support
    - link "Profile":
      - /url: http://localhost:8082/profile
  - text: QA Test User
  - button "Logout"
- main:
  - text: ✓
  - heading "Policy Created Successfully" [level=1]
  - paragraph:
    - text: Your insurance purchase has been completed for
    - strong: FinServe Secure Future Term Plan
    - text: .
  - term: Policy Number
  - definition: POL-20260925-DLHHJF
  - term: Transaction Reference
  - definition: TXN-20260925085717-DNEXR
  - term: Premium Paid
  - definition: ₹9,200
  - term: Coverage
  - definition: ₹5,000,000
  - link "View Policy":
    - /url: http://localhost:8082/policies/90
  - link "View Transactions":
    - /url: http://localhost:8082/transactions
- contentinfo: FinServe Retail Demo Platform · Built for Playwright QA Automation Practice
```

# Test source

```ts
  5   |   constructor(page) {
  6   |     this.page = page;
  7   |     // Confirmed via DevTools inspection of the real /insurance page.
  8   |     this.searchInput = page.getByTestId('insurance-search-input');
  9   |     this.typeFilter = page.getByTestId('insurance-type-filter');
  10  |     this.premiumRangeFilter = page.getByTestId('premium-range-filter');
  11  |     // Apply/Reset button testids weren't directly confirmed, but their visible text was.
  12  |     this.applyButton = page.getByRole('button', { name: 'Apply' });
  13  |     // Product cards: <article class="product-card" data-testid="insurance-card-{CODE}">
  14  |     this.productCards = page.locator('[data-testid^="insurance-card-"]');
  15  |   }
  16  | 
  17  |   async goto() {
  18  |     await this.page.goto(routes.insurance);
  19  |   }
  20  | 
  21  |   async filterByCategory(category) {
  22  |     await this.typeFilter.selectOption({ label: category });
  23  |     await this.applyButton.click();
  24  |   }
  25  | 
  26  |   async expectProductsVisible(min = 1) {
  27  |     expect(await this.productCards.count()).toBeGreaterThanOrEqual(min);
  28  |   }
  29  | 
  30  |   // Confirmed via DevTools: View Details link testid follows "insurance-details-link-{CODE}"
  31  |   async openProductByCode(productCode) {
  32  |     await this.page.getByTestId(`insurance-details-link-${productCode}`).click();
  33  |   }
  34  | 
  35  |   // Confirmed via DevTools: Buy link testid follows "buy-insurance-link-{CODE}" on the listing
  36  |   // page, navigating to /buy-insurance/{numeric id} — clicking it avoids needing to guess or
  37  |   // hardcode that numeric id ourselves (same pattern as mutual funds' View Details link).
  38  |   async gotoBuyFlow(productCode) {
  39  |     await this.goto();
  40  |     await this.page.getByTestId(`buy-insurance-link-${productCode}`).click();
  41  |   }
  42  | 
  43  |   // --- Buy-insurance flow ---
  44  |   // NOTE: confirmed via DevTools that the real buy-insurance form has NO coverage/tenure
  45  |   // selection fields at all — each product has one fixed coverage amount and premium, shown
  46  |   // read-only in the purchase summary panel. There is nothing to select/recalculate here.
  47  | 
  48  |   get insuredNameInput() {
  49  |     return this.page.getByTestId('insured-name-input');
  50  |   }
  51  |   get insuredDobInput() {
  52  |     return this.page.getByTestId('insured-dob-input');
  53  |   }
  54  |   get nomineeNameInput() {
  55  |     return this.page.getByTestId('nominee-name-input');
  56  |   }
  57  |   get nomineeRelationshipSelect() {
  58  |     return this.page.getByTestId('nominee-relationship-select');
  59  |   }
  60  |   get declarationCheckbox() {
  61  |     return this.page.getByTestId('insurance-declaration-checkbox');
  62  |   }
  63  |   get confirmPurchaseButton() {
  64  |     return this.page.getByRole('button', { name: 'Confirm Policy Purchase' });
  65  |   }
  66  |   // Confirmed via DevTools: page-level error summary, same pattern as investment/redemption
  67  |   // forms — <div class="alert alert-error" data-testid="form-error-summary">
  68  |   get validationError() {
  69  |     return this.page.getByTestId('form-error-summary');
  70  |   }
  71  |   // Confirmed via DevTools: <section class="confirmation-card" data-testid="policy-confirmation-message">
  72  |   get purchaseConfirmationBanner() {
  73  |     return this.page.getByTestId('policy-confirmation-message');
  74  |   }
  75  | 
  76  |   async fillPersonalDetails(name, dob) {
  77  |     await this.insuredNameInput.fill(name);
  78  |     // dob expected as 'YYYY-MM-DD' to match the native <input type="date">.
  79  |     await this.insuredDobInput.fill(dob);
  80  |   }
  81  | 
  82  |   async fillNominee(name, relationship) {
  83  |     await this.nomineeNameInput.fill(name);
  84  |     if (relationship) {
  85  |       await this.nomineeRelationshipSelect.selectOption({ label: relationship });
  86  |     }
  87  |   }
  88  | 
  89  |   async confirmPurchase() {
  90  |     // Declaration checkbox is mandatory on the real form. Auto-check it here unless a test is
  91  |     // specifically exercising the missing-declaration case, so field-focused negative tests
  92  |     // isolate to the field they're actually testing instead of tripping this one too.
  93  |     const isChecked = await this.declarationCheckbox.isChecked();
  94  |     if (!isChecked) {
  95  |       await this.declarationCheckbox.check();
  96  |     }
  97  |     await this.confirmPurchaseButton.click();
  98  |   }
  99  | 
  100 |   async confirmPurchaseWithoutDeclaration() {
  101 |     await this.confirmPurchaseButton.click();
  102 |   }
  103 | 
  104 |   async expectValidationError(pattern) {
> 105 |     await expect(this.validationError).toBeVisible();
      |                                        ^ Error: expect(locator).toBeVisible() failed
  106 |     if (pattern) await expect(this.validationError).toHaveText(pattern);
  107 |   }
  108 | 
  109 |   async expectPurchaseConfirmed() {
  110 |     await expect(this.purchaseConfirmationBanner).toBeVisible();
  111 |   }
  112 | }
  113 | 
  114 | module.exports = { InsurancePage };
  115 | 
```