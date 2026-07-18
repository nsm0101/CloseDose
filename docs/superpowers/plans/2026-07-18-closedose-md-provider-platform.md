# CloseDose MD Provider Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a provider-focused CloseDose platform at `md.closedose.com` with a landing page, the PIG application at `/PIG/`, and the RSI application at `/RSI/`, while establishing a safe path to a unified clinical application.

**Architecture:** Add an npm-workspace monorepo under `md/` in `nsm0101/CloseDose`. Three Vite builds assemble one static `md/dist/` output, which a new and separate Cloudflare Pages project serves at `md.closedose.com`; the existing `public/` deployment remains untouched. Preserve current PIG and RSI clinical behavior during the hosting migration, then extract shared clinical logic only after characterization tests and clinical approval.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, npm workspaces, Node.js 22, Playwright, Node test runner, GitHub Actions, Cloudflare Pages

## Global Constraints

- Production hostname is exactly `md.closedose.com`.
- Initial canonical tool routes are exactly `/PIG/` and `/RSI/`; casing is significant.
- `/PIG` and `/RSI` permanently redirect to their trailing-slash canonical routes.
- Do not modify the existing `public/` deployment or current `closedose.com` Cloudflare Pages project.
- Version 1 is static and client-only; it has no database, API, authentication, Gemini dependency, or server process.
- Do not collect or persist patient identifiers or clinical inputs.
- Preserve existing formulas, reference values, and clinical copy during the host migration.
- Import `PIG-CAR` from commit `ef67724eccc4e0cfb8b291871147fdd22b9fa811`.
- Record `PIGCAR` commit `c02d529d63d69798d081178b5537913392304541` as an alternate, but do not adopt its ETT display change in the hosting release.
- Import `CC-RSI` from commit `a309bdaa7b7736051753a852b274b295ae00c67d`.
- Require a clean production build, zero browser console errors, route smoke tests, and recorded clinical approval before activating `md.closedose.com`.

---

## Target file map

```text
md/
├── package.json
├── package-lock.json
├── sources.json
├── README.md
├── DEPLOYMENT.md
├── apps/
│   ├── portal/
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── public/_headers
│   │   ├── public/_redirects
│   │   ├── public/404.html
│   │   └── src/{main.tsx,App.tsx,index.css,toolCatalog.ts}
│   ├── pig/
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── metadata.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/{main.tsx,index.css,App.tsx}
│   └── rsi/
│       ├── package.json
│       ├── index.html
│       ├── metadata.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/**
├── tests/
│   ├── source-pins.test.mjs
│   ├── workspace-config.test.mjs
│   ├── dist-layout.test.mjs
│   └── routes.spec.ts
└── playwright.config.ts
.github/workflows/closedose-md.yml
```

`md/dist/` and Playwright artifacts are generated and ignored. The imported PIG and RSI application source stays within its own workspace. No source file in one application imports directly from the other.

### Task 1: Establish source provenance and workspace boundary

**Files:**
- Create: `md/package.json`
- Create: `md/sources.json`
- Create: `md/README.md`
- Create: `md/tests/source-pins.test.mjs`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Pinned default-branch commits from `nsm0101/PIG-CAR`, alternate `nsm0101/PIGCAR`, and `nsm0101/CC-RSI`
- Produces: npm workspace names `@closedose-md/portal`, `@closedose-md/pig`, and `@closedose-md/rsi`; machine-readable source pins in `md/sources.json`

- [ ] **Step 1: Write the failing provenance test**

Create `md/tests/source-pins.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcesUrl = new URL('../sources.json', import.meta.url);

test('provider tools are pinned to reviewed source commits', async () => {
  const sources = JSON.parse(await readFile(sourcesUrl, 'utf8'));

  assert.deepEqual(sources, {
    pig: {
      repository: 'nsm0101/PIG-CAR',
      commit: 'ef67724eccc4e0cfb8b291871147fdd22b9fa811',
      alternate: {
        repository: 'nsm0101/PIGCAR',
        commit: 'c02d529d63d69798d081178b5537913392304541',
      },
      route: '/PIG/',
    },
    rsi: {
      repository: 'nsm0101/CC-RSI',
      commit: 'a309bdaa7b7736051753a852b274b295ae00c67d',
      route: '/RSI/',
    },
  });
});
```

- [ ] **Step 2: Run the test and verify the missing manifest fails**

Run:

```bash
node --test md/tests/source-pins.test.mjs
```

Expected: FAIL with `ENOENT` for `md/sources.json`.

- [ ] **Step 3: Create the source manifest**

Create `md/sources.json`:

```json
{
  "pig": {
    "repository": "nsm0101/PIG-CAR",
    "commit": "ef67724eccc4e0cfb8b291871147fdd22b9fa811",
    "alternate": {
      "repository": "nsm0101/PIGCAR",
      "commit": "c02d529d63d69798d081178b5537913392304541"
    },
    "route": "/PIG/"
  },
  "rsi": {
    "repository": "nsm0101/CC-RSI",
    "commit": "a309bdaa7b7736051753a852b274b295ae00c67d",
    "route": "/RSI/"
  }
}
```

- [ ] **Step 4: Create the root workspace package**

Create `md/package.json`:

```json
{
  "name": "closedose-md",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build:portal": "npm run build --workspace @closedose-md/portal",
    "build:pig": "npm run build --workspace @closedose-md/pig",
    "build:rsi": "npm run build --workspace @closedose-md/rsi",
    "build": "npm run build:portal && npm run build:pig && npm run build:rsi && npm run test:dist",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test:unit": "node --test tests/source-pins.test.mjs tests/workspace-config.test.mjs",
    "test:dist": "node --test tests/dist-layout.test.mjs",
    "test:e2e": "playwright test",
    "test": "npm run typecheck && npm run test:unit",
    "preview": "vite preview --host 127.0.0.1 --port 4173"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.1",
    "vite": "^6.2.3"
  }
}
```

- [ ] **Step 5: Document local boundaries**

Create `md/README.md`:

````markdown
# CloseDose MD

Provider-focused CloseDose tools deployed at `https://md.closedose.com/`.

## Routes

- `/` — provider tool index
- `/PIG/` — Pediatric Airway Reference Calculator
- `/RSI/` — Pediatric Emergency RSI Reference & Calculator

## Local development

From `md/`:

```bash
npm ci
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/`, `/PIG/`, and `/RSI/`.

## Release boundary

This directory builds a separate Cloudflare Pages project from the existing `public/` site. The first release preserves the imported clinical behavior and does not share patient state between tools. Clinical-input persistence, patient identifiers, backend APIs, and authentication are outside the version 1 architecture.
````

- [ ] **Step 6: Ignore generated provider artifacts**

Append these lines to `.gitignore`:

```gitignore
md/node_modules/
md/dist/
md/test-results/
md/playwright-report/
```

- [ ] **Step 7: Run the provenance test**

Run:

```bash
node --test md/tests/source-pins.test.mjs
```

Expected: 1 test passes.

- [ ] **Step 8: Commit the workspace boundary**

```bash
git add .gitignore md/package.json md/sources.json md/README.md md/tests/source-pins.test.mjs
git commit -m "chore(md): establish provider workspace"
```

### Task 2: Import and repair the PIG application

**Files:**
- Create from `nsm0101/PIG-CAR@ef67724eccc4e0cfb8b291871147fdd22b9fa811`: `md/apps/pig/src/App.tsx`
- Create from the same commit: `md/apps/pig/index.html`
- Create from the same commit: `md/apps/pig/metadata.json`
- Create from the same commit: `md/apps/pig/tsconfig.json`
- Create: `md/apps/pig/package.json`
- Create: `md/apps/pig/vite.config.ts`
- Create: `md/apps/pig/src/main.tsx`
- Create: `md/apps/pig/src/index.css`
- Create: `md/tests/workspace-config.test.mjs`

**Interfaces:**
- Consumes: PIG source snapshot pinned in `md/sources.json`
- Produces: Static Vite application with package name `@closedose-md/pig`, base `/PIG/`, and output `md/dist/PIG/`

**Alternate-source decision:** `nsm0101/PIGCAR@c02d529d63d69798d081178b5537913392304541` has the same incomplete build scaffold. Its only application difference replaces the ETT backup/target/larger sizing array with a single smaller backup value and compacts the airway equipment cards. Keep the primary `PIG-CAR` rendering for this hosting-only release.

- [ ] **Step 1: Write the failing workspace configuration test**

Create `md/tests/workspace-config.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('PIG is configured for its canonical route', async () => {
  const packageJson = JSON.parse(await read('apps/pig/package.json'));
  const viteConfig = await read('apps/pig/vite.config.ts');
  const main = await read('apps/pig/src/main.tsx');

  assert.equal(packageJson.name, '@closedose-md/pig');
  assert.equal(packageJson.dependencies.react, '^19.0.1');
  assert.equal(packageJson.dependencies['lucide-react'], '^0.546.0');
  assert.match(viteConfig, /base:\s*['"]\/PIG\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist\/PIG['"]/);
  assert.match(main, /import App from ['"]\.\/App\.tsx['"]/);
});
```

- [ ] **Step 2: Run the test and verify PIG is absent**

From `md/`, run:

```bash
node --test tests/workspace-config.test.mjs
```

Expected: FAIL with `ENOENT` for `apps/pig/package.json`.

- [ ] **Step 3: Import the pinned PIG files without editing clinical content**

Use the GitHub connector to fetch these exact files from repository `nsm0101/PIG-CAR` at ref `ef67724eccc4e0cfb8b291871147fdd22b9fa811`, then write the returned UTF-8 content to the mapped destination:

```text
index.html   -> md/apps/pig/index.html
metadata.json -> md/apps/pig/metadata.json
src/App.tsx  -> md/apps/pig/src/App.tsx
tsconfig.json -> md/apps/pig/tsconfig.json
```

Do not edit `src/App.tsx` in this step. Verify its SHA-256 after writing and record the value in the pull-request description so the imported clinical snapshot is reviewable.

- [ ] **Step 4: Replace the incomplete PIG package definition**

Create `md/apps/pig/package.json`:

```json
{
  "name": "@closedose-md/pig",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.0.4",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

- [ ] **Step 5: Add the missing PIG entry point**

Create `md/apps/pig/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('PIG root element was not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Add PIG Tailwind and animation styles**

Create `md/apps/pig/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

- [ ] **Step 7: Configure the canonical PIG base and build directory**

Create `md/apps/pig/vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/PIG/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist/PIG',
    emptyOutDir: true,
  },
});
```

- [ ] **Step 8: Install dependencies, type-check, and build PIG**

From `md/`, run:

```bash
npm install
npm run typecheck --workspace @closedose-md/pig
npm run build:pig
```

Expected: TypeScript exits 0 and `dist/PIG/index.html` exists.

- [ ] **Step 9: Run the workspace configuration test**

```bash
node --test tests/workspace-config.test.mjs
```

Expected: the PIG test passes.

- [ ] **Step 10: Commit the deployable PIG workspace**

```bash
git add md/package-lock.json md/apps/pig md/tests/workspace-config.test.mjs
git commit -m "feat(md): add PIG provider tool"
```

### Task 3: Import and normalize the RSI application

**Files:**
- Create from `nsm0101/CC-RSI@a309bdaa7b7736051753a852b274b295ae00c67d`: `md/apps/rsi/index.html`
- Create from the same commit: `md/apps/rsi/metadata.json`
- Create from the same commit: `md/apps/rsi/tsconfig.json`
- Create from the same commit: `md/apps/rsi/src/App.tsx`
- Create from the same commit: `md/apps/rsi/src/main.tsx`
- Create from the same commit: `md/apps/rsi/src/index.css`
- Create from the same commit: `md/apps/rsi/src/types.ts`
- Create from the same commit: `md/apps/rsi/src/data/rsiData.ts`
- Create from the same commit: `md/apps/rsi/src/components/DosingCalculator.tsx`
- Create from the same commit: `md/apps/rsi/src/components/ProgressionTracker.tsx`
- Create from the same commit: `md/apps/rsi/src/components/ScenarioGuide.tsx`
- Create from the same commit: `md/apps/rsi/src/components/SedationReference.tsx`
- Create from the same commit: `md/apps/rsi/src/components/TransportKit.tsx`
- Create: `md/apps/rsi/package.json`
- Create: `md/apps/rsi/vite.config.ts`
- Modify: `md/tests/workspace-config.test.mjs`

**Interfaces:**
- Consumes: RSI source snapshot pinned in `md/sources.json`
- Produces: Static Vite application with package name `@closedose-md/rsi`, base `/RSI/`, and output `md/dist/RSI/`

- [ ] **Step 1: Add a failing RSI configuration test**

Append to `md/tests/workspace-config.test.mjs`:

```js
test('RSI is configured for its canonical route without server dependencies', async () => {
  const packageJson = JSON.parse(await read('apps/rsi/package.json'));
  const viteConfig = await read('apps/rsi/vite.config.ts');

  assert.equal(packageJson.name, '@closedose-md/rsi');
  assert.equal(packageJson.dependencies.react, '^19.0.1');
  assert.equal(packageJson.dependencies['@google/genai'], undefined);
  assert.equal(packageJson.dependencies.express, undefined);
  assert.equal(packageJson.dependencies.dotenv, undefined);
  assert.match(viteConfig, /base:\s*['"]\/RSI\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist\/RSI['"]/);
});
```

- [ ] **Step 2: Run the test and verify RSI is absent**

From `md/`, run:

```bash
node --test tests/workspace-config.test.mjs
```

Expected: the PIG test passes and the RSI test fails with `ENOENT`.

- [ ] **Step 3: Import the pinned RSI source tree without editing clinical content**

Use the GitHub connector to fetch the following files from repository `nsm0101/CC-RSI` at ref `a309bdaa7b7736051753a852b274b295ae00c67d` and write them to the same relative paths under `md/apps/rsi/`:

```text
index.html
metadata.json
tsconfig.json
src/App.tsx
src/main.tsx
src/index.css
src/types.ts
src/data/rsiData.ts
src/components/DosingCalculator.tsx
src/components/ProgressionTracker.tsx
src/components/ScenarioGuide.tsx
src/components/SedationReference.tsx
src/components/TransportKit.tsx
```

Do not import `.env.example`: current source contains no runtime Gemini call. Do not modify the files under `src/` in this step. Record SHA-256 values for `src/data/rsiData.ts` and `src/components/DosingCalculator.tsx` in the pull-request description.

- [ ] **Step 4: Create a browser-only RSI package definition**

Create `md/apps/rsi/package.json`:

```json
{
  "name": "@closedose-md/rsi",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.0.4",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

- [ ] **Step 5: Configure the canonical RSI base and build directory**

Create `md/apps/rsi/vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/RSI/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist/RSI',
    emptyOutDir: true,
  },
});
```

- [ ] **Step 6: Refresh the lockfile, type-check, and build RSI**

From `md/`, run:

```bash
npm install
npm run typecheck --workspace @closedose-md/rsi
npm run build:rsi
```

Expected: TypeScript exits 0 and `dist/RSI/index.html` exists.

- [ ] **Step 7: Run workspace tests**

```bash
node --test tests/source-pins.test.mjs tests/workspace-config.test.mjs
```

Expected: 3 tests pass.

- [ ] **Step 8: Commit the deployable RSI workspace**

```bash
git add md/package-lock.json md/apps/rsi md/tests/workspace-config.test.mjs
git commit -m "feat(md): add RSI provider tool"
```

### Task 4: Build the provider landing page

**Files:**
- Create: `md/apps/portal/package.json`
- Create: `md/apps/portal/index.html`
- Create: `md/apps/portal/vite.config.ts`
- Create: `md/apps/portal/src/main.tsx`
- Create: `md/apps/portal/src/App.tsx`
- Create: `md/apps/portal/src/toolCatalog.ts`
- Create: `md/apps/portal/src/index.css`
- Modify: `md/tests/workspace-config.test.mjs`

**Interfaces:**
- Consumes: Canonical routes `/PIG/` and `/RSI/`
- Produces: Provider landing page at `/` and ordinary anchor navigation into each tool

- [ ] **Step 1: Add a failing portal catalog test**

Append to `md/tests/workspace-config.test.mjs`:

```js
test('portal publishes both canonical provider routes', async () => {
  const catalog = await read('apps/portal/src/toolCatalog.ts');
  const viteConfig = await read('apps/portal/vite.config.ts');

  assert.match(catalog, /href:\s*['"]\/PIG\/['"]/);
  assert.match(catalog, /href:\s*['"]\/RSI\/['"]/);
  assert.match(viteConfig, /base:\s*['"]\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist['"]/);
});
```

- [ ] **Step 2: Run the test and verify the portal is absent**

```bash
cd md
node --test tests/workspace-config.test.mjs
```

Expected: PIG and RSI tests pass; portal test fails with `ENOENT`.

- [ ] **Step 3: Create the portal package and Vite configuration**

Create `md/apps/portal/package.json`:

```json
{
  "name": "@closedose-md/portal",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.1",
    "react-dom": "^19.0.1"
  },
  "devDependencies": {
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.0.4",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

Create `md/apps/portal/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
```

- [ ] **Step 4: Create the portal HTML and TypeScript entry point**

Create `md/apps/portal/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="CloseDose MD pediatric clinical reference tools." />
    <title>CloseDose MD | Provider Tools</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `md/apps/portal/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('CloseDose MD root element was not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Define the provider tool catalog**

Create `md/apps/portal/src/toolCatalog.ts`:

```ts
export interface ProviderTool {
  id: 'pig' | 'rsi';
  eyebrow: string;
  title: string;
  description: string;
  href: '/PIG/' | '/RSI/';
  action: string;
}

export const providerTools: ProviderTool[] = [
  {
    id: 'pig',
    eyebrow: 'Airway equipment',
    title: 'Pediatric Airway Reference',
    description: 'Age-based airway sizing, equipment preparation, vital-sign reference, and procedure checklist.',
    href: '/PIG/',
    action: 'Open PIG',
  },
  {
    id: 'rsi',
    eyebrow: 'Emergency medications',
    title: 'Pediatric RSI Reference',
    description: 'Weight-based RSI doses, scenario guidance, post-intubation sedation, timers, and transport preparation.',
    href: '/RSI/',
    action: 'Open RSI',
  },
];
```

- [ ] **Step 6: Implement the provider landing page**

Create `md/apps/portal/src/App.tsx`:

```tsx
import { providerTools } from './toolCatalog.ts';

export default function App() {
  return (
    <div className="site-shell">
      <header className="masthead">
        <a className="brand" href="/" aria-label="CloseDose MD home">
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>CloseDose <strong>MD</strong></span>
        </a>
        <span className="audience">Provider tools</span>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <p className="kicker">Pediatric care, organized for the moment</p>
          <h1 id="page-title">Clinical reference tools without the hunt.</h1>
          <p className="lede">
            Select a focused workflow. Inputs stay in this browser tab and are not saved.
          </p>
        </section>

        <section className="tool-grid" aria-label="Available provider tools">
          {providerTools.map((tool, index) => (
            <article className={`tool-card tool-card-${tool.id}`} key={tool.id}>
              <span className="tool-number">0{index + 1}</span>
              <p className="tool-eyebrow">{tool.eyebrow}</p>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
              <a href={tool.href}>{tool.action}<span aria-hidden="true"> →</span></a>
            </article>
          ))}
        </section>

        <aside className="safety-note" aria-label="Clinical safety notice">
          <strong>Clinical reference only.</strong> Confirm patient-specific decisions against current institutional resources and bedside assessment.
        </aside>
      </main>

      <footer>
        <span>CloseDose MD</span>
        <span>No patient information is stored.</span>
      </footer>
    </div>
  );
}
```

- [ ] **Step 7: Style the provider landing page**

Create `md/apps/portal/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

:root {
  color: #132b2a;
  background: #eef3ef;
  font-family: "Manrope", system-ui, sans-serif;
  font-synthesis: none;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; }
a { color: inherit; }
.site-shell { min-height: 100vh; display: flex; flex-direction: column; }
.masthead, footer { display: flex; align-items: center; justify-content: space-between; padding: 24px clamp(20px, 5vw, 72px); }
.masthead { border-bottom: 1px solid #b8c8c2; }
.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font-size: 20px; font-weight: 600; }
.brand-mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; color: white; background: #086b63; font-size: 22px; }
.audience, .kicker, .tool-eyebrow, .tool-number, footer { font-family: "DM Mono", monospace; text-transform: uppercase; letter-spacing: .08em; }
.audience { font-size: 12px; }
main { width: min(1180px, calc(100% - 40px)); margin: 0 auto; flex: 1; padding: clamp(64px, 10vw, 128px) 0 56px; }
.hero { max-width: 830px; }
.kicker { margin: 0 0 22px; color: #086b63; font-size: 12px; font-weight: 500; }
h1 { margin: 0; max-width: 760px; font-size: clamp(46px, 8vw, 92px); line-height: .98; letter-spacing: -.06em; }
.lede { max-width: 630px; margin: 30px 0 0; font-size: clamp(18px, 2vw, 23px); line-height: 1.55; color: #49635e; }
.tool-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: clamp(56px, 8vw, 96px); }
.tool-card { position: relative; min-height: 360px; padding: 34px; border: 1px solid #9fb4ad; border-radius: 28px; background: #f8faf7; overflow: hidden; }
.tool-card-pig { background: #e7f2ed; }
.tool-card-rsi { background: #f1ece6; }
.tool-number { position: absolute; top: 30px; right: 32px; color: #6b817b; font-size: 12px; }
.tool-eyebrow { margin: 0 0 72px; color: #6b817b; font-size: 11px; }
.tool-card h2 { max-width: 440px; margin: 0; font-size: clamp(30px, 4vw, 52px); line-height: 1.04; letter-spacing: -.04em; }
.tool-card > p:not(.tool-eyebrow) { max-width: 520px; color: #49635e; line-height: 1.65; }
.tool-card a { position: absolute; left: 34px; bottom: 32px; font-weight: 800; text-decoration-thickness: 2px; text-underline-offset: 5px; }
.safety-note { margin-top: 18px; padding: 18px 22px; border-left: 4px solid #d18b32; background: #fff7e7; line-height: 1.55; }
footer { border-top: 1px solid #b8c8c2; gap: 20px; color: #5b716c; font-size: 10px; }

@media (max-width: 760px) {
  .audience { display: none; }
  .tool-grid { grid-template-columns: 1fr; }
  .tool-card { min-height: 330px; }
  footer { align-items: flex-start; flex-direction: column; }
}
```

- [ ] **Step 8: Add a portal TypeScript configuration**

Create `md/apps/portal/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "allowImportingTsExtensions": true
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 9: Install, test, and build the portal**

From `md/`, run:

```bash
npm install
npm run typecheck --workspace @closedose-md/portal
node --test tests/workspace-config.test.mjs
npm run build:portal
```

Expected: portal type-check passes, all three workspace tests pass, and `dist/index.html` exists.

- [ ] **Step 10: Commit the provider portal**

```bash
git add md/package-lock.json md/apps/portal md/tests/workspace-config.test.mjs
git commit -m "feat(md): add provider tool portal"
```

### Task 5: Assemble and validate the production static output

**Files:**
- Create: `md/apps/portal/public/_redirects`
- Create: `md/apps/portal/public/_headers`
- Create: `md/apps/portal/public/404.html`
- Create: `md/tests/dist-layout.test.mjs`
- Modify: `md/package.json`

**Interfaces:**
- Consumes: Portal, PIG, and RSI workspace build outputs
- Produces: One deployable `md/dist/` directory with explicit route and security contracts

- [ ] **Step 1: Write the failing distribution layout test**

Create `md/tests/dist-layout.test.mjs`:

```js
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const dist = (path) => new URL(`../dist/${path}`, import.meta.url);

test('production output contains every public entry point', async () => {
  await Promise.all([
    access(dist('index.html')),
    access(dist('PIG/index.html')),
    access(dist('RSI/index.html')),
    access(dist('_headers')),
    access(dist('_redirects')),
    access(dist('404.html')),
  ]);
});

test('tool HTML uses its canonical asset base', async () => {
  const [pig, rsi] = await Promise.all([
    readFile(dist('PIG/index.html'), 'utf8'),
    readFile(dist('RSI/index.html'), 'utf8'),
  ]);

  assert.doesNotMatch(pig, /src="\/src\//);
  assert.doesNotMatch(rsi, /src="\/src\//);
  assert.match(pig, /(?:src|href)="\/PIG\/assets\//);
  assert.match(rsi, /(?:src|href)="\/RSI\/assets\//);
});

test('canonical no-slash routes redirect to directories', async () => {
  const redirects = await readFile(dist('_redirects'), 'utf8');

  assert.match(redirects, /^\/PIG\s+\/PIG\/\s+301$/m);
  assert.match(redirects, /^\/RSI\s+\/RSI\/\s+301$/m);
});
```

- [ ] **Step 2: Run the test before adding route files**

From `md/`, run:

```bash
node --test tests/dist-layout.test.mjs
```

Expected: FAIL because `_headers`, `_redirects`, and `404.html` are absent.

- [ ] **Step 3: Add canonical route redirects**

Create `md/apps/portal/public/_redirects`:

```text
/PIG  /PIG/  301
/RSI  /RSI/  301
```

- [ ] **Step 4: Add static security headers**

Create `md/apps/portal/public/_headers`:

```text
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
```

- [ ] **Step 5: Add a provider-specific 404 page**

Create `md/apps/portal/public/404.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tool not found | CloseDose MD</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; color: #132b2a; background: #eef3ef; font: 18px/1.5 system-ui, sans-serif; }
      main { width: min(560px, calc(100% - 40px)); }
      h1 { margin-bottom: 8px; font-size: clamp(42px, 8vw, 72px); letter-spacing: -.05em; }
      a { color: #086b63; font-weight: 800; }
    </style>
  </head>
  <body>
    <main>
      <p>404</p>
      <h1>That provider tool is not here.</h1>
      <p><a href="/">Return to CloseDose MD</a></p>
    </main>
  </body>
</html>
```

- [ ] **Step 6: Run the complete production build**

From `md/`, run:

```bash
npm run build
```

Expected: portal, PIG, and RSI build in order; 3 distribution tests pass.

- [ ] **Step 7: Verify a clean rebuild is deterministic**

Run:

```bash
npm ci
npm run build
git status --short
```

Expected: build passes and generated `md/dist/` plus `md/node_modules/` do not appear in git status.

- [ ] **Step 8: Commit production assembly rules**

```bash
git add md/apps/portal/public md/tests/dist-layout.test.mjs md/package.json md/package-lock.json
git commit -m "build(md): assemble provider deployment"
```

### Task 6: Add browser smoke tests and CI

**Files:**
- Create: `md/playwright.config.ts`
- Create: `md/tests/routes.spec.ts`
- Create: `.github/workflows/closedose-md.yml`

**Interfaces:**
- Consumes: Built `md/dist/` route tree and stable application DOM IDs
- Produces: Automated proof that the portal and both clinical tools load and perform representative interactions without console errors

- [ ] **Step 1: Create Playwright configuration**

Create `md/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Write route and interaction smoke tests**

Create `md/tests/routes.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const watchConsole = (page: Page) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

test('provider portal links to both tools', async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto('/');

  await expect(page).toHaveTitle('CloseDose MD | Provider Tools');
  await expect(page.getByRole('link', { name: /Open PIG/ })).toHaveAttribute('href', '/PIG/');
  await expect(page.getByRole('link', { name: /Open RSI/ })).toHaveAttribute('href', '/RSI/');
  expect(errors).toEqual([]);
});

test('PIG loads and changes the active airway profile', async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto('/PIG/');

  await expect(page).toHaveTitle(/Pediatric Airway Reference Calculator/);
  await expect(page.locator('#age-selector-section')).toBeVisible();
  await page.locator('#btn-age-select-2y_3y').click();
  await expect(page.locator('#current-patient-profile')).toContainText('2 to 3 Years');
  expect(errors).toEqual([]);
});

test('RSI loads and recalculates rocuronium from weight', async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto('/RSI/');

  await expect(page).toHaveTitle(/Pediatric Emergency RSI Reference/);
  await page.locator('#weight-input').fill('20');
  await expect(page.locator('#med-card-rocuronium')).toContainText('20.0');
  expect(errors).toEqual([]);
});
```

- [ ] **Step 3: Build and run browser tests locally**

From `md/`, run:

```bash
npx playwright install chromium webkit
npm run build
npm run test:e2e
```

Expected: 6 tests pass across Desktop Chrome and iPhone 15 emulation, with no console errors.

- [ ] **Step 4: Add provider-only GitHub Actions CI**

Create `.github/workflows/closedose-md.yml`:

```yaml
name: CloseDose MD

on:
  pull_request:
    paths:
      - "md/**"
      - ".github/workflows/closedose-md.yml"
  push:
    branches: [main]
    paths:
      - "md/**"
      - ".github/workflows/closedose-md.yml"

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: md
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: md/package-lock.json
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npx playwright install --with-deps chromium webkit
      - run: npm run test:e2e
```

- [ ] **Step 5: Run the same verification sequence as CI**

```bash
cd md
npm ci
npm run test
npm run build
npm run test:e2e
```

Expected: all unit/configuration tests, build tests, and browser tests pass.

- [ ] **Step 6: Commit browser verification and CI**

```bash
git add md/playwright.config.ts md/tests/routes.spec.ts .github/workflows/closedose-md.yml
git commit -m "test(md): verify provider routes in browsers"
```

### Task 7: Document and execute Cloudflare Pages deployment

**Files:**
- Create: `md/DEPLOYMENT.md`

**Interfaces:**
- Consumes: Verified `md/dist/` output on `main`
- Produces: Separate Cloudflare Pages project `closedose-md` and custom domain `md.closedose.com`

- [ ] **Step 1: Write the deployment and rollback runbook**

Create `md/DEPLOYMENT.md`:

````markdown
# CloseDose MD deployment

## Cloudflare Pages project

Create a new Pages project; do not change the existing project that serves `closedose.com`.

| Setting | Value |
|---|---|
| Project name | `closedose-md` |
| Git repository | `nsm0101/CloseDose` |
| Production branch | `main` |
| Root directory | `md` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=22` |
| Build watch include path | `md/*` |

## Preview gate

Before adding the custom domain, open the production `closedose-md.pages.dev` deployment and verify:

```bash
curl -fsSIL https://closedose-md.pages.dev/
curl -fsSIL https://closedose-md.pages.dev/PIG/
curl -fsSIL https://closedose-md.pages.dev/RSI/
```

All three canonical URLs must return a final HTTP 200. Run the browser smoke tests against the Pages URL and record the clinical review approval on the pull request.

## Custom domain

In Cloudflare: Workers & Pages → `closedose-md` → Custom domains → Set up a domain → enter `md.closedose.com` → activate.

Because `closedose.com` is already a Cloudflare zone, the Pages custom-domain flow should create the DNS record. Do not create only a manual CNAME without first associating the custom domain with the Pages project.

## Production verification

```bash
dig +short md.closedose.com
curl -fsSIL https://md.closedose.com/
curl -fsSIL https://md.closedose.com/PIG/
curl -fsSIL https://md.closedose.com/RSI/
```

Verify `/PIG` redirects to `/PIG/` and `/RSI` redirects to `/RSI/`:

```bash
curl -sSI https://md.closedose.com/PIG | sed -n '1,8p'
curl -sSI https://md.closedose.com/RSI | sed -n '1,8p'
```

Then rerun the Playwright route suite with `baseURL` set to `https://md.closedose.com`.

## Rollback

If production verification fails, use the `closedose-md` Pages deployment list to roll back to the last successful provider deployment. If no provider deployment is safe, remove `md.closedose.com` from the `closedose-md` custom domains. Do not alter the existing `closedose.com` Pages project or its DNS records.
````

- [ ] **Step 2: Push a branch and open a pull request**

Use the repository publish workflow to create a `codex/closedose-md-provider-platform` branch if not already on a task branch, push all plan implementation commits, and open a draft pull request. The pull-request description must include:

```text
- PIG source: nsm0101/PIG-CAR@ef67724eccc4e0cfb8b291871147fdd22b9fa811
- PIG alternate checked: nsm0101/PIGCAR@c02d529d63d69798d081178b5537913392304541
- RSI source: nsm0101/CC-RSI@a309bdaa7b7736051753a852b274b295ae00c67d
- PIG clinical source SHA-256
- RSI data SHA-256
- RSI calculator SHA-256
- Local verification command results
- Confirmation that `public/` is unchanged
```

- [ ] **Step 3: Verify the pull request**

Wait for the CloseDose MD GitHub Actions workflow to pass. Check out the pull-request branch from a clean worktree, run the full CI sequence, and open the local production preview at desktop and mobile widths. Confirm PIG age selection, RSI 20 kg rocuronium output, timers, tab navigation, fonts, and security-header compatibility.

Expected: all routes load, representative interactions work, and the browser console remains empty of errors.

- [ ] **Step 4: Merge and create the provider Pages project**

After CI and engineering review pass, merge the pull request. Create the `closedose-md` Pages project using the exact settings in `md/DEPLOYMENT.md`, and wait for the first `main` deployment at `closedose-md.pages.dev` to succeed. Do not attach `md.closedose.com` yet.

- [ ] **Step 5: Verify and clinically approve the Pages release**

Run the three HEAD requests from `md/DEPLOYMENT.md` against `closedose-md.pages.dev`. Open all three routes at desktop and mobile widths and rerun the representative PIG and RSI interactions.

Have the clinical owner review the `pages.dev` release and comment on the merged pull request with this exact release gate:

```text
Clinical preview reviewed. PIG and RSI formulas, reference values, warnings, and representative outputs are approved for this hosting-only release.
```

Do not activate `md.closedose.com` without that approval.

- [ ] **Step 6: Activate and verify the custom domain**

Associate `md.closedose.com` with the new Pages project, then run:

```bash
dig +short md.closedose.com
curl -fsSIL https://md.closedose.com/
curl -fsSIL https://md.closedose.com/PIG/
curl -fsSIL https://md.closedose.com/RSI/
```

Expected: DNS resolves through Cloudflare and all three canonical URLs return a final HTTP 200.

- [ ] **Step 7: Commit any runbook corrections separately**

If live deployment reveals a documentation-only discrepancy, update only `md/DEPLOYMENT.md`, verify the corrected command, and commit:

```bash
git add md/DEPLOYMENT.md
git commit -m "docs(md): correct deployment runbook"
```

## Self-review results

- Spec coverage: provider hostname, landing page, `/PIG/`, `/RSI/`, independent initial hosting, and the later all-in-one path each map to explicit tasks.
- Deployment isolation: the plan does not modify `public/` or the existing `closedose.com` project.
- Source reproducibility: all three private source repositories are pinned to exact commits, the PIG source choice is explicit, and imported file lists are complete.
- Clinical safety: the plan separates hosting from formula changes, prevents input persistence, adds representative browser calculations, and requires human approval.
- Type consistency: workspace names, routes, output directories, source manifest keys, and build commands match across tasks.
- Completeness scan: implementation steps specify exact files, content, commands, expected outcomes, and release gates.
