/**
 * Scaffolds the application workspace for a tool that is already declared in
 * tools.registry.json.
 *
 * Usage:
 *   npm run new:tool -- <tool-id>
 *
 * The registry entry is the contract; this script only materialises the files
 * that entry implies, then re-runs sync-tools so package.json, redirects, the
 * README route table, and the governance table all pick the tool up. It never
 * invents clinical content — the generated App.tsx is a placeholder that states
 * the tool is unreviewed, so a scaffold cannot be mistaken for a released tool.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { readToolRegistry, scriptSuffix } from './tool-registry.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toolId = process.argv[2];

if (!toolId) {
  console.error(
    'Usage: npm run new:tool -- <tool-id>\n\n' +
      'The tool must already have an entry in md/tools.registry.json.'
  );
  process.exit(1);
}

const registry = await readToolRegistry();
const tool = registry.tools.find((entry) => entry.id === toolId);

if (!tool) {
  console.error(
    `No registry entry for "${toolId}".\n\n` +
      `Add it to md/tools.registry.json first. Known ids:\n` +
      registry.tools.map((entry) => `  ${entry.id}`).join('\n')
  );
  process.exit(1);
}

if (!tool.workspace) {
  console.error(
    `"${toolId}" is registered as planned, so it has no workspace to scaffold.\n\n` +
      'Give it a workspace and packageName in md/tools.registry.json, change its\n' +
      'release.kind from "planned" to "gated" (with approvalRoles), then re-run.\n' +
      'Clinical tools should enter as "gated" so they stay out of production\n' +
      'builds until named approvals are recorded.'
  );
  process.exit(1);
}

const appRoot = path.join(mdRoot, tool.workspace);
const routeDirectory = tool.route.replaceAll('/', '');
const suffix = scriptSuffix(tool.workspace);

const exists = await readFile(path.join(appRoot, 'package.json'), 'utf8')
  .then(() => true)
  .catch(() => false);

if (exists) {
  console.error(`${tool.workspace} already exists. Nothing to scaffold.`);
  process.exit(1);
}

const files = {
  'package.json': `${JSON.stringify(
    {
      name: tool.packageName,
      version: '0.1.0',
      private: true,
      description: `CloseDose MD ${tool.title}`,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        typecheck: 'tsc --noEmit',
        ...((tool.tests ?? []).length > 0 && tool.workspaceTestScript
          ? { test: `node --test ${tool.tests.map((file) => `../../${file}`).join(' ')}` }
          : {})
      },
      dependencies: { react: '^19.0.1', 'react-dom': '^19.0.1' },
      devDependencies: {
        '@tailwindcss/vite': '^4.1.14',
        '@types/react': '^19.2.14',
        '@types/react-dom': '^19.2.3',
        '@vitejs/plugin-react': '^5.0.4',
        tailwindcss: '^4.1.14',
        typescript: '~5.8.2',
        vite: '^6.2.3'
      },
      closedoseMd: { routeBase: tool.route }
    },
    null,
    2
  )}\n`,

  'tsconfig.json': `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: true,
        module: 'ESNext',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        isolatedModules: true,
        moduleDetection: 'force',
        jsx: 'react-jsx',
        allowImportingTsExtensions: true,
        noEmit: true,
        strict: true
      },
      include: ['src']
    },
    null,
    2
  )}\n`,

  'vite.config.ts': `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '${tool.route}',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../../dist/${routeDirectory}', emptyOutDir: true }
});
`,

  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>${tool.title} | CloseDose MD</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  'src/main.tsx': `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,

  'src/index.css': `@import "tailwindcss";

@theme {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --font-display: ui-sans-serif, system-ui, sans-serif;
}
`,

  'src/App.tsx': `/**
 * ${tool.title}
 *
 * Scaffolded placeholder. Replace this with the reviewed clinical implementation
 * described in the tool's clinical and implementation specifications before
 * requesting release approval.
 */
export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6 py-16 font-sans">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        ${tool.shortTitle}
      </p>
      <h1 className="text-3xl font-semibold text-slate-900">${tool.title}</h1>
      <p className="text-slate-600">${tool.task}</p>
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        This tool is scaffolded but not clinically reviewed. It is not decision
        support and must not be used for patient care.
      </p>
    </main>
  );
}
`
};

await mkdir(path.join(appRoot, 'src'), { recursive: true });
for (const [relativePath, contents] of Object.entries(files)) {
  await writeFile(path.join(appRoot, relativePath), contents, 'utf8');
  console.log(`created ${path.join(tool.workspace, relativePath)}`);
}

// A gated tool with no manifest record fails the build closed. Seed the record
// in its withheld state so the workspace stays buildable while the tool remains
// out of production until real approvals are recorded.
if (tool.release.kind === 'gated') {
  const manifestPath = path.join(mdRoot, 'clinical-release-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!manifest[tool.release.manifestKey]) {
    manifest[tool.release.manifestKey] = {
      status: 'Clinical review',
      publicReleaseApproved: false,
      clinicalReviewDate: null,
      reviewers: []
    };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(
      `created clinical-release-manifest.json record for ${tool.release.manifestKey} (withheld)`
    );
  }
}

const sync = spawnSync(process.execPath, ['scripts/sync-tools.mjs'], {
  cwd: mdRoot,
  stdio: 'inherit'
});
if (sync.status !== 0) process.exit(sync.status ?? 1);

console.log(
  `\nScaffolded ${tool.id} at ${tool.route}\n\n` +
    'Next:\n' +
    '  1. npm install                      # link the new workspace\n' +
    `  2. npm run dev --workspace ${tool.packageName}\n` +
    `  3. Implement src/App.tsx against docs/provider-tools/${tool.id}/\n` +
    `  4. npm run typecheck:${suffix} && npm run test:unit\n` +
    (tool.release.kind === 'gated'
      ? '  5. Record named approvals in clinical-release-manifest.json before release\n'
      : '')
);
