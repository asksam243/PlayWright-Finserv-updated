const { expect } = require('@playwright/test');
const { routes } = require('../fixtures/testData');

class TransactionPage {
  constructor(page) {
    this.page = page;
    // Confirmed via DevTools inspection of the real /transactions page.
    this.transactionsPage = page.getByTestId('transactions-page');
    this.searchInput = page.getByPlaceholder('Reference or product name');
    this.typeFilter = page.getByTestId('transaction-type-filter');
    this.statusFilter = page.getByTestId('transaction-status-filter');
    this.applyButton = page.getByTestId('transaction-filter-submit');
    this.resetButton = page.getByTestId('transaction-filter-reset');
    // Confirmed via DevTools: <tr data-testid="transaction-row-{TXN_ID}"> — same pattern
    // as the dashboard's recent-transactions widget.
    this.transactionRows = page.locator('[data-testid^="transaction-row-"]');
    // Confirmed via DevTools: <td class="empty-state" data-testid="transactions-empty-state">
    this.emptyState = page.getByTestId('transactions-empty-state');
  }

  async goto() {
    await this.page.goto(routes.transactions);
  }

  async filterByType(type) {
    await this.typeFilter.selectOption({ label: type });
    await this.applyButton.click();
    // Belt-and-suspenders: wait for the first type cell to actually have non-empty text before
    // callers try to read it, given the Firefox render-timing race noted above.
    const firstTypeCell = this.page.locator('[data-testid^="transaction-type-"]').first();
    if (await firstTypeCell.count() > 0) {
      await expect(firstTypeCell).not.toHaveText('');
    }
  }

  async filterByStatus(status) {
    await this.statusFilter.selectOption({ label: status });
    await this.applyButton.click();
  }

  async getLatestTransactionId() {
    const first = this.transactionRows.first();
    const testId = await first.getAttribute('data-testid');
    // testid format: "transaction-row-TXN-20260724121705-IKOKO" — strip the known prefix.
    return testId ? testId.replace('transaction-row-', '') : '';
  }

  async expectTransactionVisible(transactionId) {
    await expect(this.page.getByTestId(`transaction-row-${transactionId}`)).toBeVisible();
  }

  async expectRowCount(min) {
    expect(await this.transactionRows.count()).toBeGreaterThanOrEqual(min);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  // Confirmed via DevTools: <td data-testid="transaction-type-{TXN_ID}">Premium Payment</td>
  // Uses allTextContents() rather than allInnerTexts() — the latter is layout/render-timing
  // dependent and was confirmed (5/5 repeat runs) to intermittently return empty strings on
  // Firefox right after the filter form's full-page navigation, even though the rows existed.
  // textContent() reads the raw DOM text and isn't subject to that render-timing race.
  async getAllVisibleTypeLabels() {
    return this.page.locator('[data-testid^="transaction-type-"]').allTextContents();
  }
}

module.exports = { TransactionPage };