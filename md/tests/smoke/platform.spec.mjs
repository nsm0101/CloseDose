import { expect, test } from '@playwright/test';

import { resolveCloseDoseMdTarget } from '../helpers/target.mjs';

const target = resolveCloseDoseMdTarget();
const expectedUrl = (pathname) => new URL(pathname, target.baseURL).href;

const documentPaths = new Set(['/', '/PIG/', '/RSI/']);
const resourceTypes = new Map([
  ['css', 'stylesheet'],
  ['js', 'script'],
  ['png', 'image'],
  ['webp', 'image'],
  ['woff2', 'font']
]);

function isExpectedRequestPath(pathname, resourceType) {
  if (documentPaths.has(pathname)) return resourceType === 'document';
  if (pathname === '/404.css') return resourceType === 'stylesheet';

  const asset = pathname.match(
    /^\/(?:PIG\/|RSI\/)?assets\/[A-Za-z0-9_.-]+-[A-Za-z0-9_-]{8,}\.(css|js|png|webp|woff2)$/
  );

  return Boolean(asset && resourceTypes.get(asset[1]) === resourceType);
}

function auditRuntime(context) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const externalRequests = [];
  const sameOriginRequestViolations = [];
  const unexpectedPages = [];
  const initialPages = new Set(context.pages());
  const attachedPages = new WeakSet();

  const attachPageListeners = (page) => {
    if (attachedPages.has(page)) return;
    attachedPages.add(page);
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`${page.url()} ${message.text()}`);
    });
    page.on('pageerror', (error) => pageErrors.push(`${page.url()} ${error.message}`));
  };

  for (const page of initialPages) attachPageListeners(page);
  context.on('page', (page) => {
    attachPageListeners(page);
    if (!initialPages.has(page)) unexpectedPages.push(page);
  });
  context.on('requestfailed', (request) => {
    failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? 'failed'}`);
  });
  context.on('request', (request) => {
    const url = new URL(request.url());
    if (!/^https?:$/.test(url.protocol)) return;
    if (url.origin !== target.expectedOrigin) {
      externalRequests.push(request.url());
      return;
    }

    const violations = [];
    if (request.method() !== 'GET') violations.push(`method=${request.method()}`);
    if (url.search) violations.push(`query=${url.search}`);
    if (request.postData() !== null) violations.push('request-body');
    if (!isExpectedRequestPath(url.pathname, request.resourceType())) {
      violations.push(`unexpected-path-or-type=${url.pathname}:${request.resourceType()}`);
    }
    if (violations.length > 0) {
      sameOriginRequestViolations.push(`${request.method()} ${request.url()} ${violations.join(',')}`);
    }
  });

  const snapshot = () => ({
    consoleErrors: [...consoleErrors],
    pageErrors: [...pageErrors],
    failedRequests: [...failedRequests],
    externalRequests: [...externalRequests],
    sameOriginRequestViolations: [...sameOriginRequestViolations],
    unexpectedPages: unexpectedPages.map((page) => page.url())
  });

  return {
    snapshot,
    assertClean() {
      const audit = snapshot();
      expect(audit.consoleErrors, 'console errors on any page').toEqual([]);
      expect(audit.pageErrors, 'page errors on any page').toEqual([]);
      expect(audit.failedRequests, 'failed requests in the browser context').toEqual([]);
      expect(audit.externalRequests, 'external requests in the browser context').toEqual([]);
      expect(
        audit.sameOriginRequestViolations,
        'unexpected same-origin methods, bodies, queries, paths, or resource types'
      ).toEqual([]);
      expect(audit.unexpectedPages, 'unexpected popup pages').toEqual([]);
    }
  };
}

test('portal fits exactly 320 px and both ordinary tool links navigate', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
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
  await expect(page).toHaveURL(expectedUrl('/PIG/'));
  await expect(page.getByRole('heading', { name: /Critical Care Airway Reference/ })).toBeVisible();

  await page.goBack();
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: /Pediatric Emergency RSI Reference and Calculator/ }).click();
  await expect(page).toHaveURL(expectedUrl('/RSI/'));
  await expect(page.getByRole('heading', { name: 'Critical Airway Utility' })).toBeVisible();
  runtimeAudit.assertClean();
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

  for (const route of ['/pig', '/pig/', '/rsi', '/rsi/']) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status(), route).toBe(404);
    expect(await response.text(), route).toContain('That provider page was not found.');
  }

  const portal = await request.get('/');
  expect(portal.status()).toBe(200);
  const csp = portal.headers()['content-security-policy'];
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("style-src 'self';");
  expect(csp).toContain("style-src-elem 'self';");
  expect(csp).toContain("style-src-attr 'unsafe-inline';");
  expect(csp).not.toContain("style-src 'self' 'unsafe-inline'");
  expect(portal.headers()['x-content-type-options']).toBe('nosniff');
  expect(portal.headers()['cache-control']).toBe('public, max-age=0, must-revalidate');

  const notFoundStyles = await request.get('/404.css');
  expect(notFoundStyles.status()).toBe(200);
  expect(notFoundStyles.headers()['cache-control']).toBe(
    'public, max-age=0, must-revalidate'
  );
});

test('PIG age selection updates sizing and its procedure timer runs', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.goto('/PIG/');
  await expect(page).toHaveURL(expectedUrl('/PIG/'));

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
  runtimeAudit.assertClean();
});

test('RSI calculates 20 kg rocuronium and exposes its core tabs and timer', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.goto('/RSI/');
  await expect(page).toHaveURL(expectedUrl('/RSI/'));

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
  const cprTimer = page.locator('#interval-timer-cpr-loop');
  const progressBar = cprTimer.locator('[style]');
  await expect(progressBar).toHaveAttribute('style', 'width: 0%;');
  await cprTimer.getByRole('button', { name: 'Start' }).click();
  await expect(progressBar).toHaveAttribute('style', /width:\s*0\.[0-9]+%;/, { timeout: 3_000 });
  await cprTimer.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Start Airway Clock' }).click();
  await expect(page.locator('#progression-tracker')).toContainText(/00:0[1-9]/, { timeout: 3_000 });
  await page.getByRole('button', { name: 'Pause Clock' }).click();

  await page.getByRole('button', { name: /5\. Transport Kit/ }).click();
  await expect(page.getByText('Critical PICU Transport Reference')).toBeVisible();
  await expect(page.getByRole('button', { name: 'B. Vasopressors' })).toBeVisible();
  runtimeAudit.assertClean();
});

test('CSP blocks inline style elements while permitting the RSI style attribute mechanism', async ({ page }) => {
  await page.goto('/RSI/');

  const result = await page.evaluate(async () => {
    const host = document.createElement('div');
    host.style.width = '200px';
    const target = document.createElement('div');
    target.id = 'csp-style-probe';
    target.style.width = '37%';
    host.append(target);
    document.body.append(host);

    const inlineSheet = document.createElement('style');
    inlineSheet.textContent = '#csp-style-probe { height: 123px !important; }';
    document.head.append(inlineSheet);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    return {
      attributeWidth: getComputedStyle(target).width,
      inlineElementHeight: getComputedStyle(target).height
    };
  });

  expect(result.attributeWidth).toBe('74px');
  expect(result.inlineElementHeight).not.toBe('123px');
});

test('browser-context audit rejects same-origin query and body requests', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.goto('/');

  await page.evaluate(async () => {
    await Promise.all([
      fetch('/?audit-probe=query'),
      fetch('/', { method: 'POST', body: 'audit-probe=body' })
    ]);
  });

  await expect.poll(() => runtimeAudit.snapshot().sameOriginRequestViolations.length).toBe(2);
  const violations = runtimeAudit.snapshot().sameOriginRequestViolations.join('\n');
  expect(violations).toContain('query=?audit-probe=query');
  expect(violations).toContain('method=POST');
  expect(violations).toContain('request-body');
  expect(() => runtimeAudit.assertClean()).toThrow();
});

test('browser-context audit detects popup navigation and popup requests', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.goto('/');

  const popupPromise = context.waitForEvent('page');
  await page.evaluate((popupUrl) => window.open(popupUrl, '_blank'), expectedUrl('/?popup-audit=1'));
  const popup = await popupPromise;
  await popup.waitForLoadState('networkidle');
  await popup.evaluate(() => {
    console.error('popup-audit-console-probe');
    setTimeout(() => {
      throw new Error('popup-audit-page-probe');
    }, 0);
  });
  await expect.poll(() => runtimeAudit.snapshot().pageErrors.length).toBe(1);

  const audit = runtimeAudit.snapshot();
  expect(audit.unexpectedPages).toEqual([expectedUrl('/?popup-audit=1')]);
  expect(
    audit.sameOriginRequestViolations.some((violation) =>
      violation.includes('query=?popup-audit=1')
    )
  ).toBe(true);
  expect(audit.consoleErrors.some((error) => error.includes('popup-audit-console-probe'))).toBe(true);
  expect(audit.pageErrors.some((error) => error.includes('popup-audit-page-probe'))).toBe(true);
  expect(() => runtimeAudit.assertClean()).toThrow();
  await popup.close();
});
