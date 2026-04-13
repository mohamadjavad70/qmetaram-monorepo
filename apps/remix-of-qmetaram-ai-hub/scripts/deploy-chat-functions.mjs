import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const appRoot = process.cwd();
const configPath = path.join(appRoot, 'supabase', 'config.toml');

function readProjectId(filePath) {
  const file = fs.readFileSync(filePath, 'utf8');
  const match = file.match(/^project_id\s*=\s*"([^"]+)"/m);
  if (!match) {
    throw new Error('Could not find project_id in supabase/config.toml');
  }

  return match[1];
}

const projectId = readProjectId(configPath);
const functionsToDeploy = ['ai-chat', 'multi-model-orchestration'];

function deployFunction(functionName) {
  const command = `npx --yes supabase functions deploy ${functionName} --project-ref ${projectId}`;

  if (process.platform === 'win32') {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', command], {
      cwd: appRoot,
      env: {
        ...process.env,
        CI: '1',
      },
      stdio: 'inherit',
      shell: false,
    });
  }

  return spawnSync('sh', ['-lc', command], {
    cwd: appRoot,
    env: {
      ...process.env,
      CI: '1',
    },
    stdio: 'inherit',
    shell: false,
  });
}

for (const functionName of functionsToDeploy) {
  console.log(`Deploying ${functionName} to ${projectId}...`);

  const result = deployFunction(functionName);

  if (result.status !== 0) {
    console.error(
      `Deploy failed for ${functionName}. Ensure the active Supabase CLI account has deploy access to project ${projectId}.`,
    );
    process.exit(result.status ?? 1);
  }
}

console.log('Chat function deploy completed.');