import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(mdRoot, 'dist');
const staticRoot = path.join(mdRoot, 'static');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runNpm(script) {
  const result = spawnSync(npmCommand, ['run', script], {
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

for (const workspace of ['build:portal', 'build:pig', 'build:rsi', 'build:pmd']) {
  runNpm(workspace);
}

await cp(staticRoot, distRoot, { recursive: true });
runNpm('test:contract');
