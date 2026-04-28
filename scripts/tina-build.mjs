import { spawnSync } from 'node:child_process';

const hasCloudCredentials = Boolean(process.env.TINA_CLIENT_ID && process.env.TINA_TOKEN);
const localArgs = ['build', '--local', '--skip-cloud-checks'];

const runTinaBuild = (args) =>
  spawnSync('npx', ['tinacms', ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

const mode = hasCloudCredentials ? 'cloud' : 'local-fallback';
console.log(`[tina-build] Using ${mode} mode`);

let result;

if (hasCloudCredentials) {
  result = runTinaBuild(['build']);
  if (result.status !== 0) {
    console.warn('[tina-build] Cloud build failed. Falling back to local Tina build.');
    result = runTinaBuild(localArgs);
  }
} else {
  result = runTinaBuild(localArgs);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
