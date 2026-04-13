import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const reportPath = resolve(process.cwd(), 'qnet-status.txt');

if (!existsSync(reportPath)) {
  console.error('qnet-status.txt not found. Run `npm run qnet:smart-deploy` first.');
  process.exit(1);
}

process.stdout.write(readFileSync(reportPath, 'utf8'));
