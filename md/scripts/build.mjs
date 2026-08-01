import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  getBuildWorkspaceScripts,
  readClinicalReleaseManifest
} from './clinical-release-manifest.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(mdRoot, 'dist');
const staticRoot = path.join(mdRoot, 'static');
const buildModePath = path.join(mdRoot, '.build-mode');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const mode = process.argv[2];
const manifest = await readClinicalReleaseManifest();
const workspaceScripts = getBuildWorkspaceScripts(mode, manifest);

function runNpm(script) {
  const modeAwareWorkspace = {
    'build:airway-scenarios': '@closedose-md/airway-scenarios',
    'build:device': '@closedose-md/device',
    'build:sedation': '@closedose-md/sedation'
  }[script];
  const args = modeAwareWorkspace
    ? ['run', 'build', '--workspace', modeAwareWorkspace, '--', '--mode', mode]
    : ['run', script];
  const result = spawnSync(npmCommand, args, {
    cwd: mdRoot,
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

await rm(distRoot, { force: true, recursive: true });
await mkdir(distRoot, { recursive: true });
await writeFile(buildModePath, `${mode}\n`, 'utf8');

for (const workspace of workspaceScripts) {
  runNpm(workspace);
}

await cp(staticRoot, distRoot, { recursive: true });
runNpm('test:contract');
