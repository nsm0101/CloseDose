import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { resolveCloseDoseMdTarget } from '../helpers/target.mjs';

const target = resolveCloseDoseMdTarget();
const expectedUrl = (pathname) => new URL(pathname, target.baseURL).href;

const distRoot = fileURLToPath(new URL('../../dist/', import.meta.url));
const canonicalDocuments = new Map([
  ['/', 'document'],
  ['/PIG/', 'document'],
  ['/RSI/', 'document'],
  ['/AIRWAY-SCENARIOS/', 'document'],
  ['/POST-INTUBATION/', 'document'],
  ['/RSI-TIMELINE/', 'document'],
  ['/AIRWAY-TRANSPORT/', 'document'],
  ['/PMD/', 'document']
]);
const physicalEntryDocuments = new Set([
  'index.html',
  'PIG/index.html',
  'RSI/index.html',
  'AIRWAY-SCENARIOS/index.html',
  'POST-INTUBATION/index.html',
  'RSI-TIMELINE/index.html',
  'AIRWAY-TRANSPORT/index.html',
  'PMD/index.html'
]);
const controlFiles = new Set(['_headers', '_redirects']);
const resourceTypesByExtension = new Map([
  ['.css', 'stylesheet'],
  ['.html', 'document'],
  ['.js', 'script'],
  ['.webmanifest', 'other'],
  ['.png', 'image'],
  ['.webp', 'image'],
  ['.woff2', 'font']
]);

async function listArtifactFiles(directory = distRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listArtifactFiles(entryPath) : [entryPath];
    })
  );

  return nestedFiles.flat();
}

async function buildExactRequestAllowlist() {
  const allowlist = new Map(canonicalDocuments);

  for (const file of (await listArtifactFiles()).sort()) {
    const relativePath = path.relative(distRoot, file).split(path.sep).join('/');
    if (physicalEntryDocuments.has(relativePath) || controlFiles.has(relativePath)) continue;

    const resourceType = resourceTypesByExtension.get(path.extname(relativePath));
    if (!resourceType) throw new Error(`unclassified distribution file: ${relativePath}`);
    allowlist.set(`/${relativePath}`, resourceType);
  }

  return allowlist;
}

const exactRequestAllowlist = await buildExactRequestAllowlist();
const knownAllowedScriptPath = [...exactRequestAllowlist]
  .find(([, resourceType]) => resourceType === 'script')?.[0];

if (!knownAllowedScriptPath) throw new Error('assembled artifact has no allowlisted script');

function isExpectedRequestPath(pathname, resourceType) {
  return exactRequestAllowlist.get(pathname) === resourceType;
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

async function textContrastRatio(locator) {
  return locator.evaluate((element) => {
    const parseRgb = (value) => {
      const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return channels.length >= 3 ? channels.slice(0, 3) : null;
    };
    const luminance = (channels) => {
      const linear = channels.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };

    const foreground = parseRgb(getComputedStyle(element).color);
    let background = null;
    let current = element;
    while (current && !background) {
      const value = getComputedStyle(current).backgroundColor;
      if (value !== 'transparent' && !value.endsWith(', 0)')) background = parseRgb(value);
      current = current.parentElement;
    }
    background ??= [255, 255, 255];
    if (!foreground) throw new Error('Unable to resolve foreground color');
    const lighter = Math.max(luminance(foreground), luminance(background));
    const darker = Math.min(luminance(foreground), luminance(background));
    return (lighter + 0.05) / (darker + 0.05);
  });
}

test('portal fits exactly 320 px and every available tool link navigates', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Clinical tools. Ready when needed.' })).toBeVisible();
  await expect(page.getByText('15 tools shown')).toBeVisible();
  const availableTools = [
    {
      title: 'Pediatric Airway Reference Calculator',
      route: '/PIG/',
      heading: /Critical Care Airway Reference/
    },
    {
      title: 'Pediatric RSI Medication Calculator',
      route: '/RSI/',
      heading: 'Pediatric RSI Medication Calculator'
    },
    {
      title: 'Pediatric Airway Scenario Guide',
      route: '/AIRWAY-SCENARIOS/',
      heading: 'Pediatric Airway Scenario Guide'
    },
    {
      title: 'Post-Intubation Sedation Reference',
      route: '/POST-INTUBATION/',
      heading: 'Post-Intubation Sedation Reference'
    },
    {
      title: 'RSI Progression Timeline',
      route: '/RSI-TIMELINE/',
      heading: 'RSI Progression Timeline'
    },
    {
      title: 'Pediatric Airway Transport Kit',
      route: '/AIRWAY-TRANSPORT/',
      heading: 'Pediatric Airway Transport Kit'
    },
    {
      title: 'PREtendingMD: PEM FlowMaster',
      route: '/PMD/',
      heading: 'Authorized clinical team access'
    }
  ];

  for (const tool of availableTools) {
    await expect(page.getByRole('link', { name: new RegExp(tool.title) })).toHaveAttribute(
      'href',
      tool.route
    );
  }
  await expect(page.getByLabel('Peds Device Rescue, Clinical review')).toBeVisible();
  await expect(page.getByLabel('Pediatric Comfort and Sedation Console, Clinical review')).toBeVisible();
  await expect(page.getByRole('link', { name: /Peds Device Rescue/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Pediatric Comfort and Sedation Console/ })).toHaveCount(0);

  const firstToolBox = await page
    .getByRole('link', { name: /Pediatric Airway Reference Calculator/ })
    .boundingBox();
  expect(firstToolBox?.y).toBeLessThan(800);

  const horizontalMetrics = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  expect(horizontalMetrics).toEqual({ body: 0, document: 0 });

  for (const tool of availableTools) {
    await page.getByRole('link', { name: new RegExp(tool.title) }).click();
    await expect(page).toHaveURL(expectedUrl(tool.route));
    await expect(page.getByRole('heading', { name: tool.heading })).toBeVisible();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  }
  runtimeAudit.assertClean();
});

test('provider suite discovery works across phone, tablet, desktop, light, and dark', async ({
  page,
  context
}) => {
  const runtimeAudit = auditRuntime(context);
  const viewports = [
    { width: 320, height: 800 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 }
  ];

  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme });
    for (const viewport of viewports) {
      await page.goto('about:blank');
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const horizontalMetrics = await page.evaluate(() => ({
        body: document.body.scrollWidth - document.body.clientWidth,
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth
      }));
      expect(horizontalMetrics).toEqual({ body: 0, document: 0 });

      const search = page.getByRole('searchbox', { name: 'Search provider tools' });
      await search.fill('newborn');
      await expect(page.getByText('1 tool shown')).toBeVisible();
      await expect(page.getByLabel('Sick Newborn: First 15 Minutes, Planned')).toBeVisible();

      if (viewport.width < 768) {
        await page.getByRole('button', { name: 'Audience and status' }).click();
        for (const filterName of ['All clinicians', 'Community EM', 'PEM', 'All statuses', 'Available', 'Clinical review', 'Planned']) {
          const filterBox = await page.getByRole('button', { name: filterName, exact: true }).boundingBox();
          expect(filterBox?.height, `${filterName} touch target`).toBeGreaterThanOrEqual(44);
        }
      }
      await page.getByRole('button', { name: 'Clinical review' }).click();
      await expect(page.getByText('No tools match these filters')).toBeVisible();
      await page.getByRole('button', { name: 'Reset filters' }).click();
      await expect(page.getByText('15 tools shown')).toBeVisible();

      await page.getByRole('button', { name: 'Community EM' }).click();
      await expect(page.getByRole('button', { name: 'Community EM' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      await page.getByRole('button', { name: 'Clinical review' }).click();
      await expect(page.getByText('2 tools shown')).toBeVisible();
      await expect(page.getByRole('link', { name: /Peds Device Rescue/ })).toHaveCount(0);
      await page.getByRole('button', { name: 'Reset filters' }).click();

      await search.focus();
      await expect(search).toBeFocused();
      await page.keyboard.press('Tab');
      if (viewport.width < 768) {
        await expect(page.getByRole('button', { name: 'Audience and status' })).toBeFocused();
      } else {
        await expect(page.getByRole('button', { name: 'All clinicians' })).toBeFocused();
      }
    }
  }

  runtimeAudit.assertClean();
});

test('canonical redirects and unknown-route 404 are explicit', async ({ request }) => {
  for (const [route, location] of [
    ['/PIG', '/PIG/'],
    ['/RSI', '/RSI/'],
    ['/AIRWAY-SCENARIOS', '/AIRWAY-SCENARIOS/'],
    ['/POST-INTUBATION', '/POST-INTUBATION/'],
    ['/RSI-TIMELINE', '/RSI-TIMELINE/'],
    ['/AIRWAY-TRANSPORT', '/AIRWAY-TRANSPORT/'],
    ['/PMD', '/PMD/']
  ]) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(location);
  }

  const missing = await request.get('/not-a-clinical-tool');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('That provider page was not found.');

  for (const route of [
    '/pig', '/pig/', '/rsi', '/rsi/', '/pmd', '/pmd/',
    '/airway-scenarios', '/airway-scenarios/',
    '/post-intubation', '/post-intubation/',
    '/rsi-timeline', '/rsi-timeline/',
    '/airway-transport', '/airway-transport/'
  ]) {
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

test('PMD loads its signed-out workflow shell without remote analytics', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.setViewportSize({ width: 320, height: 800 });
  const response = await page.goto('/PMD/');
  await expect(page).toHaveTitle('PREtendingMD — PEM FlowMaster');
  await expect(
    page.getByRole('heading', { name: 'Authorized clinical team access' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue with Google' })
  ).toBeVisible();
  await expect(page.getByText(/Patient and operational data sync/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Account' })).toHaveCount(0);
  expect(response?.headers()['cross-origin-opener-policy']).toBe(
    'same-origin-allow-popups'
  );

  const horizontalMetrics = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  expect(horizontalMetrics).toEqual({ body: 0, document: 0 });
  runtimeAudit.assertClean();
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

test('standalone RSI tools keep independent state and expose one workflow per route', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.goto('/RSI/');
  await expect(page).toHaveURL(expectedUrl('/RSI/'));
  await expect(page.locator('[data-workflow]')).toHaveCount(1);
  await expect(page.locator('[data-workflow]')).toHaveAttribute('data-workflow', 'rsi-medications');
  await expect(page.getByRole('link', { name: 'CloseDose MD provider suite' })).toHaveAttribute('href', '/');

  const weightInput = page.getByPlaceholder('Enter kg');
  await weightInput.fill('20');
  await expect(weightInput).toHaveValue('20');
  await expect(page.locator('#med-card-rocuronium')).toContainText(/20\.0\s*mg/);

  await page.goto('/AIRWAY-SCENARIOS/');
  await expect(page.locator('[data-workflow]')).toHaveAttribute('data-workflow', 'airway-scenarios');
  await expect(page.getByLabel('Verified weight')).toHaveValue('10');
  await expect(page.getByLabel('Clinical review status')).toContainText('Not approved for clinical use');
  await page.getByLabel('Exact age').fill('2');
  await page.getByLabel('Age unit').selectOption('months');
  await page.getByRole('radio', { name: /Status Epilepticus/ }).check();
  await page.getByRole('checkbox', { name: /Known or suspected hyperkalemia/ }).check();
  await expect(page.locator('#scenario-reference-title')).toHaveText('Status Epilepticus');
  await expect(page.locator('.scenario-warning-list')).toContainText('Young-infant airway considerations');
  await expect(page.locator('.scenario-warning-list')).toContainText('Succinylcholine safety warning');

  await page.goto('/POST-INTUBATION/');
  await expect(page.locator('[data-workflow]')).toHaveAttribute('data-workflow', 'post-intubation');
  await expect(page.getByRole('heading', { name: 'Post-Intubation Sedation & Analgesia' })).toBeVisible();
  await page.getByLabel('Verified weight').fill('24');
  await page.getByRole('button', { name: 'Reset local tool' }).click();
  await expect(page.getByLabel('Verified weight')).toHaveValue('10');

  await page.goto('/RSI-TIMELINE/');
  await expect(page.locator('[data-workflow]')).toHaveAttribute('data-workflow', 'rsi-timeline');
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

  await page.goto('/AIRWAY-TRANSPORT/');
  await expect(page.locator('[data-workflow]')).toHaveAttribute('data-workflow', 'airway-transport');
  await expect(page.getByText('Critical PICU Transport Reference')).toBeVisible();
  await expect(page.getByRole('button', { name: 'B. Vasopressors' })).toBeVisible();
  runtimeAudit.assertClean();
});

test('airway scenario guide remains readable in dark mode at phone width', async ({ page, context }) => {
  const runtimeAudit = auditRuntime(context);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/AIRWAY-SCENARIOS/');
  await page.waitForLoadState('networkidle');

  await page.getByRole('checkbox', { name: /Known or suspected hyperkalemia/ }).check();
  const contrastTargets = [
    page.getByLabel('Clinical review status').locator('strong'),
    page.locator('.scenario-choice[data-selected="true"] > span'),
    page.getByText('Succinylcholine safety warning', { exact: true }),
    page.getByText('Preferred in imported scenario', { exact: true }),
    page.getByText('Alternative in imported scenario', { exact: true }),
    page.getByText('Avoid or warning in imported scenario', { exact: true })
  ];

  for (const target of contrastTargets) {
    await expect(target).toBeVisible();
    expect(await textContrastRatio(target), await target.innerText()).toBeGreaterThanOrEqual(4.5);
  }

  const horizontalMetrics = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  expect(horizontalMetrics).toEqual({ body: 0, document: 0 });
  runtimeAudit.assertClean();
});

test('CSP blocks inline style elements while permitting the RSI style attribute mechanism', async ({ page }) => {
  await page.goto('/RSI-TIMELINE/');

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

  await expect.poll(() =>
    runtimeAudit.snapshot().sameOriginRequestViolations.some((violation) =>
      violation.includes('query=?audit-probe=query')
    )
  ).toBe(true);
  await expect.poll(() =>
    runtimeAudit.snapshot().sameOriginRequestViolations.some((violation) =>
      violation.includes('method=POST')
    )
  ).toBe(true);
  await expect.poll(() =>
    runtimeAudit.snapshot().sameOriginRequestViolations.some((violation) =>
      violation.includes('request-body')
    )
  ).toBe(true);
  expect(() => runtimeAudit.assertClean()).toThrow();
});

test('browser-context audit rejects an unexpected same-origin GET path', async ({
  page,
  context
}) => {
  const runtimeAudit = auditRuntime(context);
  await page.goto('/');

  await page.evaluate(() => fetch('/runtime-audit-unexpected-path'));

  await expect.poll(() =>
    runtimeAudit.snapshot().sameOriginRequestViolations.some((violation) =>
      violation.includes('unexpected-path-or-type=/runtime-audit-unexpected-path:fetch')
    )
  ).toBe(true);
  expect(() => runtimeAudit.assertClean()).toThrow();
});

test('browser-context audit rejects an exact allowed asset with the wrong resource type', async ({
  page,
  context
}) => {
  const runtimeAudit = auditRuntime(context);
  await page.goto('/');

  await page.evaluate((assetPath) => fetch(assetPath), knownAllowedScriptPath);

  await expect.poll(() =>
    runtimeAudit.snapshot().sameOriginRequestViolations.some((violation) =>
      violation.includes(`unexpected-path-or-type=${knownAllowedScriptPath}:fetch`)
    )
  ).toBe(true);
  expect(() => runtimeAudit.assertClean()).toThrow();
});

test('browser-context audit classifies a deterministically fulfilled external request', async ({
  page,
  context
}) => {
  const runtimeAudit = auditRuntime(context);
  const externalProbeUrl = 'https://runtime-audit.invalid/external-probe';
  await context.route(externalProbeUrl, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>External runtime audit probe</title>'
    })
  );

  await page.goto(externalProbeUrl);

  await expect.poll(() => runtimeAudit.snapshot().externalRequests).toContain(externalProbeUrl);
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
  await expect.poll(() => runtimeAudit.snapshot().unexpectedPages).toEqual([
    expectedUrl('/?popup-audit=1')
  ]);
  await expect.poll(() =>
    runtimeAudit.snapshot().sameOriginRequestViolations.some((violation) =>
      violation.includes('query=?popup-audit=1')
    )
  ).toBe(true);
  await expect.poll(() =>
    runtimeAudit.snapshot().consoleErrors.some((error) =>
      error.includes('popup-audit-console-probe')
    )
  ).toBe(true);
  await expect.poll(() =>
    runtimeAudit.snapshot().pageErrors.some((error) =>
      error.includes('popup-audit-page-probe')
    )
  ).toBe(true);
  expect(() => runtimeAudit.assertClean()).toThrow();
  await popup.close();
});
