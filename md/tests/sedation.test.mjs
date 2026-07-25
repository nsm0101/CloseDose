import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

import {
  MEDICATION_OPTIONS,
  calculateMedicationOption
} from '../apps/sedation/src/sedationCalculations.mjs';

import { findPrivacyViolations } from './helpers/privacy-scan.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sedationRoot = path.join(mdRoot, 'apps/sedation');

const assertCommonMetadata = (result) => {
  assert.equal(typeof result.source.title, 'string');
  assert.equal(typeof result.source.date, 'string');
  assert.equal(typeof result.calculationBasis, 'string');
  assert.equal(typeof result.units, 'string');
  assert.equal(typeof result.cap, 'object');
  assert.equal(typeof result.population, 'string');
  assert.equal(typeof result.onset, 'string');
  assert.equal(typeof result.monitoringDepth, 'string');
};

test('intranasal midazolam returns the source range, caps, population, onset, and one-decimal doses', () => {
  const result = calculateMedicationOption(
    'intranasal-midazolam',
    12.34,
    6
  );

  assert.equal(result.excluded, false);
  assert.equal(result.units, 'mg');
  assert.deepEqual(result.doses.initial, {
    minimum: 2.5,
    maximum: 4.9
  });
  assert.deepEqual(result.cap, {
    totalMaximum: '10 mg',
    perNarisMaximum: '5 mg per naris'
  });
  assert.equal(result.population, 'Infants and children');
  assert.equal(result.onset, '10-15 min');
  assert.match(result.calculationBasis, /0\.2-0\.4 mg\/kg/);
  assertCommonMetadata(result);
});

test('intranasal midazolam applies the upper-range cap at and above 25 kg', () => {
  assert.deepEqual(
    calculateMedicationOption('intranasal-midazolam', 24.8, 24).doses.initial,
    { minimum: 5, maximum: 9.9 }
  );
  assert.deepEqual(
    calculateMedicationOption('intranasal-midazolam', 25, 24).doses.initial,
    { minimum: 5, maximum: 10 }
  );
  assert.deepEqual(
    calculateMedicationOption('intranasal-midazolam', 30, 24).doses.initial,
    { minimum: 6, maximum: 10 }
  );
});

test('intranasal fentanyl returns the source range, caps, population, onset, and one-decimal doses', () => {
  const result = calculateMedicationOption(
    'intranasal-fentanyl',
    12.34,
    12
  );

  assert.equal(result.excluded, false);
  assert.equal(result.units, 'mcg');
  assert.deepEqual(result.doses.initial, {
    minimum: 18.5,
    maximum: 24.7
  });
  assert.deepEqual(result.cap, {
    totalMaximum: '100 mcg',
    perNarisMaximum: '50 mcg per naris'
  });
  assert.equal(result.population, 'Children age 12 months and older');
  assert.equal(result.onset, '7-20 min');
  assert.match(result.calculationBasis, /1\.5-2 mcg\/kg/);
  assertCommonMetadata(result);
});

test('intranasal fentanyl applies the upper-range cap at and above 50 kg', () => {
  assert.deepEqual(
    calculateMedicationOption('intranasal-fentanyl', 49.9, 120).doses.initial,
    { minimum: 74.9, maximum: 99.8 }
  );
  assert.deepEqual(
    calculateMedicationOption('intranasal-fentanyl', 50, 120).doses.initial,
    { minimum: 75, maximum: 100 }
  );
  assert.deepEqual(
    calculateMedicationOption('intranasal-fentanyl', 60, 120).doses.initial,
    { minimum: 90, maximum: 100 }
  );
});

test('IV ketamine returns initial and repeat ranges with the source interval and cumulative cap', () => {
  const result = calculateMedicationOption('iv-ketamine', 12.34, 3);

  assert.equal(result.excluded, false);
  assert.equal(result.units, 'mg');
  assert.deepEqual(result.doses.initial, {
    minimum: 12.3,
    maximum: 18.5
  });
  assert.deepEqual(result.doses.repeat, {
    minimum: 3.1,
    maximum: 6.2,
    intervalMinutes: 10
  });
  assert.equal(result.doses.cumulativeCap, 55.5);
  assert.deepEqual(result.cap, {
    cumulativeMaximum: '4.5 mg/kg'
  });
  assert.equal(result.population, 'Children age 3 months and older');
  assert.match(result.calculationBasis, /1-1\.5 mg\/kg/);
  assert.match(result.calculationBasis, /0\.25-0\.5 mg\/kg/);
  assertCommonMetadata(result);
});

test('IM ketamine returns initial and repeat amounts with the source interval and cumulative cap', () => {
  const result = calculateMedicationOption('im-ketamine', 12.34, 3);

  assert.equal(result.excluded, false);
  assert.equal(result.units, 'mg');
  assert.deepEqual(result.doses.initial, { value: 49.4 });
  assert.deepEqual(result.doses.repeat, {
    value: 24.7,
    intervalMinutes: 10
  });
  assert.equal(result.doses.cumulativeCap, 74);
  assert.deepEqual(result.cap, {
    cumulativeMaximum: '6 mg/kg'
  });
  assert.equal(result.population, 'Children age 3 months and older');
  assert.match(result.calculationBasis, /Initial 4 mg\/kg/);
  assert.match(result.calculationBasis, /repeat 2 mg\/kg at 10 minutes/);
  assertCommonMetadata(result);
});

test('invalid weights are rejected before calculation', () => {
  for (const weight of [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    0.49,
    200.01
  ]) {
    assert.throws(
      () => calculateMedicationOption('intranasal-midazolam', weight, 24),
      /Weight must be a finite number from 0\.5 kg through 200 kg/
    );
  }
});

test('source population exclusions return metadata and no dose', () => {
  for (const [optionId, ageMonths, expectedReason] of [
    [
      'intranasal-fentanyl',
      11,
      'Source population starts at age 12 months'
    ],
    ['iv-ketamine', 2, 'Source population starts at age 3 months'],
    ['im-ketamine', 2, 'Source population starts at age 3 months']
  ]) {
    const result = calculateMedicationOption(optionId, 10, ageMonths);

    assert.equal(result.excluded, true);
    assert.equal(result.exclusionReason, expectedReason);
    assert.equal('doses' in result, false);
    assertCommonMetadata(result);
  }
});

test('unknown medication identifiers are rejected', () => {
  assert.throws(
    () => calculateMedicationOption('unknown-option', 10, 24),
    /Unknown medication option: unknown-option/
  );
});

test('medication metadata is deeply immutable and all four options are exposed', () => {
  assert.deepEqual(
    MEDICATION_OPTIONS.map(({ id }) => id),
    [
      'intranasal-midazolam',
      'intranasal-fentanyl',
      'iv-ketamine',
      'im-ketamine'
    ]
  );
  assert.equal(Object.isFrozen(MEDICATION_OPTIONS), true);
  for (const option of MEDICATION_OPTIONS) {
    assert.equal(Object.isFrozen(option), true);
    assert.equal(Object.isFrozen(option.source), true);
    assert.equal(Object.isFrozen(option.cap), true);
  }
});

test('Sedation app source contract is review-gated, phone-first, and privacy bounded', async () => {
  const [
    packageJsonSource,
    viteConfig,
    indexHtml,
    appSource,
    styles,
    mainSource,
    calculationSource,
    declarationSource,
    tsconfigSource
  ] =
    await Promise.all([
      readFile(path.join(sedationRoot, 'package.json'), 'utf8'),
      readFile(path.join(sedationRoot, 'vite.config.ts'), 'utf8'),
      readFile(path.join(sedationRoot, 'index.html'), 'utf8'),
      readFile(path.join(sedationRoot, 'src/App.tsx'), 'utf8'),
      readFile(path.join(sedationRoot, 'src/index.css'), 'utf8'),
      readFile(path.join(sedationRoot, 'src/main.tsx'), 'utf8'),
      readFile(
        path.join(sedationRoot, 'src/sedationCalculations.mjs'),
        'utf8'
      ),
      readFile(
        path.join(sedationRoot, 'src/sedationCalculations.d.ts'),
        'utf8'
      ),
      readFile(path.join(sedationRoot, 'tsconfig.json'), 'utf8')
    ]);
  const packageJson = JSON.parse(packageJsonSource);

  assert.equal(packageJson.name, '@closedose-md/sedation');
  assert.equal(packageJson.closedoseMd?.routeBase, '/SEDATION/');
  assert.match(viteConfig, /base:\s*['"]\/SEDATION\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist\/SEDATION['"]/);
  assert.match(indexHtml, /src=["']\/src\/main\.tsx["']/);

  for (const text of [
    'Pediatric Comfort and Sedation',
    'Clinical review',
    'Not approved for clinical use',
    'Laceration repair',
    'Fracture reduction',
    'Abscess drainage',
    'Foreign-body removal',
    'Imaging',
    'Vascular access',
    'Other',
    'Airway or OSA concern',
    'Respiratory illness',
    'ASA III or greater',
    'Congenital heart disease',
    'Previous sedation complication',
    'Interacting sedative',
    'SOAPME',
    'Recovery criteria',
    'Copy identifier-free documentation'
  ]) {
    assert.match(appSource, new RegExp(text));
  }

  assert.match(appSource, /ageMonths:\s*''/);
  assert.match(appSource, /weightKg:\s*''/);
  assert.match(appSource, /procedure:\s*''/);
  assert.match(appSource, /setInterval/);
  assert.match(appSource, /clearInterval/);
  assert.match(appSource, /catch\s*\{/);
  assert.match(
    appSource,
    /Copy failed\. Select and copy the documentation preview manually\./
  );
  assert.doesNotMatch(appSource, /[–—]/);

  assert.match(styles, /color-scheme:\s*light dark/);
  assert.match(styles, /--color-accent:\s*#18a78d/i);
  assert.match(styles, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  assert.match(styles, /@media\s*\(min-width:/);
  assert.doesNotMatch(styles, /@media\s*\(max-width:/);
  assert.match(styles, /:focus-visible/);

  const applicationSources = [
    ['package.json', packageJsonSource],
    ['vite.config.ts', viteConfig],
    ['index.html', indexHtml],
    ['src/App.tsx', appSource],
    ['src/index.css', styles],
    ['src/main.tsx', mainSource],
    ['src/sedationCalculations.mjs', calculationSource],
    ['src/sedationCalculations.d.ts', declarationSource],
    ['tsconfig.json', tsconfigSource]
  ];
  assert.deepEqual(
    applicationSources.flatMap(([file, source]) =>
      findPrivacyViolations(source, file)
    ),
    []
  );
});

test(
  'Sedation UI preserves neutral state, separate options, timer boundaries, and recovery limits',
  { timeout: 30_000 },
  async () => {
    const server = await createServer({
      configFile: path.join(sedationRoot, 'vite.config.ts'),
      logLevel: 'silent',
      root: sedationRoot,
      server: {
        host: '127.0.0.1',
        port: 0
      }
    });
    let browser;

    try {
      await server.listen();
      const address = server.httpServer?.address();
      assert.ok(address && typeof address !== 'string');
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({
        colorScheme: 'dark',
        viewport: { width: 390, height: 844 }
      });
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto(`http://127.0.0.1:${address.port}/SEDATION/`, {
        waitUntil: 'networkidle'
      });
      assert.equal(await page.locator('input:checked').count(), 0);
      assert.equal(
        await page
          .getByRole('heading', {
            level: 3,
            name: 'Not approved for clinical use'
          })
          .count(),
        1
      );

      await page
        .getByRole('button', { name: 'Enter review workspace' })
        .click();
      assert.equal(await page.locator('input[type=radio]:checked').count(), 0);
      assert.equal(await page.locator('select').inputValue(), '');
      assert.equal(
        await page
          .locator('body')
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
        true
      );

      await page.getByLabel('Age in months').fill('12');
      await page.getByLabel('Weight in kg').fill('12.34');
      await page.getByRole('button', { name: '2 Compare' }).click();
      assert.equal(await page.locator('.medication-card').count(), 4);
      assert.match(
        await page.locator('.medication-card').nth(0).innerText(),
        /2\.5 to 4\.9 mg/
      );
      assert.match(
        await page.locator('.medication-card').nth(1).innerText(),
        /18\.5 to 24\.7 mcg/
      );

      await page
        .getByRole('button', { name: 'Start 10 minute reference timer' })
        .first()
        .click();
      assert.equal(await page.getByRole('timer').count(), 1);
      assert.equal(
        await page.getByRole('timer').getAttribute('aria-live'),
        null
      );
      assert.match(
        await page.locator('.sr-only[aria-live="polite"]').innerText(),
        /10 minute reference timer started/
      );

      await page.getByRole('button', { name: '1 Context' }).click();
      await page.getByLabel('Weight in kg').fill('13');
      await page.getByRole('button', { name: '2 Compare' }).click();
      assert.equal(await page.getByRole('timer').count(), 0);

      await page.getByRole('button', { name: '1 Context' }).click();
      await page.getByLabel('Age in months').fill('2');
      await page
        .getByRole('group', { name: 'Interacting sedative' })
        .getByText('Present', { exact: true })
        .click();
      assert.match(
        await page.getByText(/Interacting sedative recorded/).innerText(),
        /Do not combine/
      );
      await page.getByRole('button', { name: '2 Compare' }).click();
      assert.equal(
        await page.getByText('Outside named source population').count(),
        3
      );

      await page.getByRole('button', { name: '4 Recovery' }).click();
      assert.equal(
        await page.locator('.recovery-grid input:checked').count(),
        0
      );
      assert.match(
        await page.locator('.boundary-banner').innerText(),
        /does not declare recovery complete or authorize discharge/
      );

      await page.getByRole('button', { name: '5 Document' }).click();
      const documentation = await page
        .getByLabel('Selectable identifier-free documentation preview')
        .innerText();
      assert.match(documentation, /Interacting sedative: Present/);
      assert.match(documentation, /No agent selected or recommended/);
      assert.deepEqual(pageErrors, []);
    } finally {
      await browser?.close();
      await server.close();
    }
  }
);

test('clinical and implementation specifications preserve review and release boundaries', async () => {
  const [clinicalSource, implementationSource] = await Promise.all([
    readFile(
      path.join(mdRoot, '..', 'docs/provider-tools/sedation/clinical.md'),
      'utf8'
    ),
    readFile(
      path.join(mdRoot, '..', 'docs/provider-tools/sedation/implementation.md'),
      'utf8'
    )
  ]);

  for (const reviewer of [
    'Pediatric emergency medicine',
    'Pediatric pharmacy',
    'Pediatric anesthesia'
  ]) {
    assert.match(clinicalSource, new RegExp(reviewer));
  }
  assert.match(clinicalSource, /regulatory gate/i);
  assert.match(clinicalSource, /December 2025/);
  assert.match(clinicalSource, /December 2021/);
  assert.match(clinicalSource, /February 2023/);
  assert.match(implementationSource, /local tab/i);
  assert.match(implementationSource, /No identifiers/);
  assert.match(implementationSource, /No persistence/);
  assert.match(implementationSource, /No analytics/);
  assert.match(implementationSource, /No AI/);
  assert.match(implementationSource, /No external runtime calls/);
  assert.match(implementationSource, /\/SEDATION\//);
});
