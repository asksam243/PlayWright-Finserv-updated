const { expect } = require('@playwright/test');

/** Parses a currency string like "₹6,75,430.00" into a number: 675430.00 */
function parseCurrency(text) {
  const cleaned = text.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned);
}

/** Asserts a locator's numeric/currency text matches an expected value within a tolerance. */
async function assertAmountCloseTo(locator, expected, tolerance = 0.01) {
  const text = await locator.innerText();
  const actual = parseCurrency(text);
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

/** Asserts an API response is OK and returns parsed JSON, failing with a clear message otherwise. */
async function expectOkJson(response) {
  expect(response.ok(), `Expected OK response, got ${response.status()} - ${await response.text()}`).toBeTruthy();
  return response.json();
}

/** Reconciles a UI-displayed value against an API field for the same business entity. */
async function assertUiMatchesApi(uiLocator, apiValue) {
  const uiText = (await uiLocator.innerText()).trim();
  const apiText = String(apiValue).trim();
  const uiNumeric = parseCurrency(uiText);
  const apiNumeric = parseFloat(apiText);
  if (!isNaN(uiNumeric) && !isNaN(apiNumeric)) {
    expect(Math.abs(uiNumeric - apiNumeric)).toBeLessThanOrEqual(0.01);
  } else {
    expect(uiText).toContain(apiText);
  }
}

module.exports = { parseCurrency, assertAmountCloseTo, expectOkJson, assertUiMatchesApi };
