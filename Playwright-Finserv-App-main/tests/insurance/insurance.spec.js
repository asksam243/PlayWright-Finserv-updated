const { test, expect } = require('../../fixtures/auth.fixture');
const { InsurancePage } = require('../../pages/InsurancePage');
const { insuranceProducts, nomineeDetails } = require('../../fixtures/testData');
const { pastDobForAge } = require('../../utils/dataGenerator');

test.describe('Insurance Discovery @insurance', () => {
  test('insurance listing shows available products @smoke', async ({ qaUserPage }) => {
    const insurance = new InsurancePage(qaUserPage);
    await insurance.goto();
    await insurance.expectProductsVisible(1);
  });

  test('filtering by category narrows the product list @regression', async ({ qaUserPage }) => {
    const insurance = new InsurancePage(qaUserPage);
    await insurance.goto();
    await insurance.filterByCategory(insuranceProducts.termLife.category);
    await insurance.expectProductsVisible(1);
  });
});

test.describe('Insurance Purchase @insurance', () => {
  test('completing all mandatory fields results in a confirmed policy @smoke', async ({ qaUserPage }) => {
    const insurance = new InsurancePage(qaUserPage);
    await insurance.gotoBuyFlow(insuranceProducts.termLife.productCode);
    await insurance.fillPersonalDetails('Anita Sharma', pastDobForAge(35));
    await insurance.fillNominee(nomineeDetails.valid.name, nomineeDetails.valid.relationship);
    await insurance.confirmPurchase();
    await insurance.expectPurchaseConfirmed();
  });

  test('missing mandatory nominee name blocks purchase @regression', async ({ qaUserPage }) => {
    const insurance = new InsurancePage(qaUserPage);
    await insurance.gotoBuyFlow(insuranceProducts.termLife.productCode);
    await insurance.fillPersonalDetails('Anita Sharma', pastDobForAge(35));
    await insurance.fillNominee(nomineeDetails.missingName.name, nomineeDetails.missingName.relationship);
    await insurance.confirmPurchase();
    // Confirmed via DevTools: exact real error text is "The nominee name field is required."
    await insurance.expectValidationError(/nominee name/i);
  });

  // NOTE: A "premium recalculates when coverage or tenure changes" test previously lived here.
  // Removed after confirming via DevTools that the real buy-insurance form has NO coverage or
  // tenure selection at all — each product has one fixed coverage amount and premium, shown
  // read-only in the purchase summary. That test exercised a feature that doesn't exist in
  // this build; worth noting in the Assignment 3 QA summary as a scope/feature-gap observation
  // rather than a defect.
});