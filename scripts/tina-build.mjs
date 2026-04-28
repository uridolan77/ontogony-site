import { spawnSync } from 'node:child_process';

const hasCloudCredentials = Boolean(process.env.TINA_CLIENT_ID && process.env.TINA_TOKEN);
const args = hasCloudCredentials
  ? ['build']
  : ['build', '--local', '--skip-cloud-checks'];

const mode = hasCloudCredentials ? 'cloud' : 'local-fallback';
console.log(`[tina-build] Using ${mode} mode`);

const result = spawnSync('npx', ['tinacms', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
