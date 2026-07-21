import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('nnc-q3-rewards-PRODUCTION-v2 (2)', 'draft-b2b-rewards-v2');
const output = resolve('dist-draft');

if (!existsSync(source)) {
  throw new Error(`Static draft source is missing: ${source}`);
}

rmSync(output, { recursive: true, force: true });
cpSync(source, output, { recursive: true });

const indexPath = resolve(output, 'index.html');
const buildId = Date.now().toString();
writeFileSync(indexPath, readFileSync(indexPath, 'utf8').replaceAll('__BUILD_ID__', buildId));

console.log(`Built deployable static landing: ${output} (asset version ${buildId})`);
