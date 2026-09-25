/** Attaches a labeled screenshot to the current test's report (in addition to on-failure capture). */
async function captureEvidence(page, testInfo, label) {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
}

/** Waits for a toast/snackbar-style message and returns its text. Adjust selector to the app's actual component. */
async function getToastMessage(page) {
  const toast = page.locator('[data-testid="toast-message"], .toast, .alert');
  await toast.first().waitFor({ state: 'visible', timeout: 5000 });
  return (await toast.first().innerText()).trim();
}

/** Retries an async assertion-style function until it passes or times out. Use sparingly; prefer Playwright auto-waiting. */
async function retryUntil(fn, timeoutMs = 5000, intervalMs = 250) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  throw lastError;
}

/** Downloads triggered by a click (e.g. statement/policy download) and returns the saved file path. */
async function captureDownload(page, triggerLocatorClick) {
  const [download] = await Promise.all([page.waitForEvent('download'), triggerLocatorClick()]);
  const path = await download.path();
  return { suggestedFilename: download.suggestedFilename(), path };
}

module.exports = { captureEvidence, getToastMessage, retryUntil, captureDownload };
