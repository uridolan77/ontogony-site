import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const targets = [
  'public/admin',
  'tina/__generated__',
  'tina/tina-lock.json',
];

for (const target of targets) {
  rmSync(resolve(target), { force: true, recursive: true });
}

console.log('[tina-clean] Removed generated Tina artifacts.');