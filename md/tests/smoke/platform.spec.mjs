import { expect, test } from '@playwright/test';

const expectedOrigin = 'http://127.0.0.1:4173';

function auditRuntime(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const externalRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? 'failed'}`);
  });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (/^https?:$/.test(url.protocol) && url.origin !== expectedOrigin) {
      externalRequests.push(request.url());
    }
  });

  return () => {
    expect(consoleErrors, 'console errors').toEqual([]);
    expect(pageErrors, 'page errors').toEqual([]);
    expect(failedRequests, 'failed requests').toEqual([]);
    expect(externalRequests, 'external requests').toEqual([]);
  };
}

test('portal fits exactly 320 px and both ordinary tool links navigate', async ({ page }) => {
  const assertRuntimeClean = auditRuntime(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Clinical tools. Ready when needed.' })).toBeVisible();
  const pigLink = page.getByRole('link', { name: /Pediatric Airway Reference Calculator/ });
  const rsiLink = page.getByRole('link', { name: /Pediatric Emergency RSI Reference and Calculator/ });
  await expect(pigLink).toHaveAttribute('href', '/PIG/');
  await expect(rsiLink).toHaveAttribute('href', '/RSI/');

  const horizontalMetrics = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  expect(horizontalMetrics).toEqual({ body: 0, document: 0 });

  await pigLink.click();
  await expect(page).toHaveURL(`${expectedOrigin}/PIG/`);
  await expect(page.getByRole('heading', { name: /Critical Care Airway Reference/ })).toBeVisible();

  await page.goBack();
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: /Pediatric Emergency RSI Reference and Calculator/ }).click();
  await expect(page).toHaveURL(`${expectedOrigin}/RSI/`);
  await expect(page.getByRole('heading', { name: 'Critical Airway Utility' })).toBeVisible();
  assertRuntimeClean();
});

test('canonical redirects and unknown-route 404 are explicit', async ({ request }) => {
  for (const [route, location] of [['/PIG', '/PIG/'], ['/RSI', '/RSI/']]) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(location);
  }

  const missing = await request.get('/not-a-clinical-tool');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('That provider page was not found.');

  const portal = await request.get('/');
  expect(portal.status()).toBe(200);
  expect(portal.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(portal.headers()['x-content-type-options']).toBe('nosniff');
  expect(portal.headers()['cache-control']).toBe('public, max-age=0, must-revalidate');
});

test('PIG age selection updates sizing and its procedure timer runs', async ({ page }) => {
  const assertRuntimeClean = auditRuntime(page);
  await page.goto('/PIG/');
  await expect(page).toHaveURL(`${expectedOrigin}/PIG/`);

  await page.getByRole('button', { name: '12y-14y', exact: true }).click();
  const profile = page.locator('#current-patient-profile');
  await expect(profile).toContainText('12 to 14 Years');
  await expect(profile).toContainText('48 kg');

  const ettCard = page.locator('#card-ett-size');
  await expect(ettCard).toContainText('Cuffed ETT Size');
  await expect(ettCard.getByText('6.0-7.0', { exact: true }).first()).toBeVisible();
  await expect(ettCard.getByText('5.5', { exact: true })).toBeVisible();
  await expect(ettCard.getByText('7.5', { exact: true })).toBeVisible();

  const timerPanel = page.locator('#procedure-timer-panel');
  await page.getByTitle('Start Timer').click();
  await expect(timerPanel).toContainText(/00:0[1-9]/, { timeout: 3_000 });
  await page.getByTitle('Pause').click();
  assertRuntimeClean();
});

test('RSI calculates 20 kg rocuronium and exposes its core tabs and timer', async ({ page }) => {
  const assertRuntimeClean = auditRuntime(page);
  await page.goto('/RSI/');
  await expect(page).toHaveURL(`${expectedOrigin}/RSI/`);

  const weightInput = page.getByPlaceholder('Enter kg');
  await weightInput.fill('20');
  await expect(weightInput).toHaveValue('20');
  await expect(page.locator('#med-card-rocuronium')).toContainText(/20\.0\s*mg/);

  await page.getByRole('button', { name: /2\. Scenario Guide/ }).click();
  await expect(page.getByText('Patient-Specific Contraindications Triage')).toBeVisible();
  await page.getByRole('button', { name: /Hyperkalemia/ }).click();
  await expect(page.getByText('CRITICAL CONTRAINDICATION ALERT:')).toBeVisible();

  await page.getByRole('button', { name: /3\. Post-Sedation/ }).click();
  await expect(page.getByRole('heading', { name: 'Post-Intubation Sedation & Analgesia' })).toBeVisible();

  await page.getByRole('button', { name: /4\. Progression Tracker/ }).click();
  await expect(page.getByText('RSI Procedure Stopwatch')).toBeVisible();
  await page.getByRole('button', { name: 'Start Airway Clock' }).click();
  await expect(page.locator('#progression-tracker')).toContainText(/00:0[1-9]/, { timeout: 3_000 });
  await page.getByRole('button', { name: 'Pause Clock' }).click();

  await page.getByRole('button', { name: /5\. Transport Kit/ }).click();
  await expect(page.getByText('Critical PICU Transport Reference')).toBeVisible();
  await expect(page.getByRole('button', { name: 'B. Vasopressors' })).toBeVisible();
  assertRuntimeClean();
});
