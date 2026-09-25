const { expect } = require('@playwright/test');
const { routes } = require('../fixtures/testData');

class PolicyPage {
  constructor(page) {
    this.page = page;
    // Confirmed via DevTools: <div class="page-header" data-testid="policies-page">
    this.policiesPage = page.getByTestId('policies-page');
    // Confirmed via DevTools: <select id="status" data-testid="policy-status-filter">
    this.statusFilter = page.getByTestId('policy-status-filter');
    this.applyButton = page.getByRole('button', { name: 'Apply' });
    // Confirmed via DevTools: <tr data-testid="policy-row-{N}"> where N is a numeric row id.
    this.policyRows = page.locator('[data-testid^="policy-row-"]');
    // NOT YET CONFIRMED — haven't seen the zero-policies state yet.
    this.emptyState = page.getByTestId('policies-empty-state');
    // Confirmed via DevTools: <section class="detail-card" data-testid="policy-details-page">
    this.policyDetailsPage = page.getByTestId('policy-details-page');
    // Confirmed via DevTools: <span class="badge">Active</span> — no data-testid on this
    // element itself, but reliably scoped within the policy-details-page container.
    this.statusBadge = this.policyDetailsPage.locator('.badge');
    // Confirmed via DevTools: <span class="muted" data-testid="policy-detail-number">
    this.policyDetailNumber = page.getByTestId('policy-detail-number');
    // Confirmed via DevTools: <button data-testid="download-policy-button">. This is a plain
    // type="button" with no href or form action — confirmed manually that clicking it does
    // NOT actually trigger a file download in this demo build. Treat it as a UI element to
    // check for presence/clickability only, not as a real download to wait on.
    this.downloadButton = page.getByTestId('download-policy-button');
  }

  async goto() {
    await this.page.goto(routes.policies);
  }

  async openFirstPolicy() {
    // Confirmed via DevTools: each policy row ends with a "View" link to the detail page.
    await this.policyRows.first().getByRole('link', { name: 'View' }).click();
  }

  async expectPolicyCount(min) {
    expect(await this.policyRows.count()).toBeGreaterThanOrEqual(min);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async getStatusText() {
    return (await this.statusBadge.innerText()).trim();
  }
}

module.exports = { PolicyPage };