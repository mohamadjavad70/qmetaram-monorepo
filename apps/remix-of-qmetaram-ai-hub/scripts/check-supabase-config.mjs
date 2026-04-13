import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const envPath = path.join(appRoot, '.env');
const configPath = path.join(appRoot, 'supabase', 'config.toml');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((result, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return result;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        return result;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      result[key] = value;
      return result;
    }, {});
}

function readProjectId(filePath) {
  const file = fs.readFileSync(filePath, 'utf8');
  const match = file.match(/^project_id\s*=\s*"([^"]+)"/m);
  if (!match) {
    throw new Error('Could not find project_id in supabase/config.toml');
  }

  return match[1];
}

function getProjectRefFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.split('.')[0] || null;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = Buffer.from(normalized + padding, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isPlaceholderKey(value) {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();
  return normalized.includes('your_publishable_key_here') || normalized.includes('your_actual_publishable_key_here');
}

const env = parseEnvFile(envPath);
const projectId = readProjectId(configPath);
const url = env.VITE_SUPABASE_URL || '';
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const urlProjectRef = getProjectRefFromUrl(url);
const jwtPayload = decodeJwtPayload(publishableKey);
const keyProjectRef = jwtPayload?.ref || null;
const issues = [];
const warnings = [];

if (!fs.existsSync(envPath)) {
  issues.push('.env file is missing. Copy .env.example to .env first.');
}

if (!url) {
  issues.push('VITE_SUPABASE_URL is missing.');
} else if (urlProjectRef !== projectId) {
  issues.push(`VITE_SUPABASE_URL points to ${urlProjectRef || 'an invalid host'}, but supabase/config.toml expects ${projectId}.`);
}

if (isPlaceholderKey(publishableKey)) {
  issues.push('VITE_SUPABASE_PUBLISHABLE_KEY is missing or still a placeholder.');
}

if (keyProjectRef && keyProjectRef !== projectId) {
  issues.push(`The configured JWT key belongs to Supabase project ${keyProjectRef}, not ${projectId}.`);
}

if (!keyProjectRef && publishableKey && !publishableKey.startsWith('sb_publishable_')) {
  warnings.push('The publishable key is not a legacy JWT anon key and could not be project-validated automatically.');
}

console.log('Supabase chat configuration check');
console.log(`- Expected project: ${projectId}`);
console.log(`- Configured URL: ${url || '(missing)'}`);
console.log(`- URL project ref: ${urlProjectRef || '(invalid)'}`);
console.log(`- Publishable key: ${publishableKey ? '(set)' : '(missing)'}`);
if (keyProjectRef) {
  console.log(`- Key project ref: ${keyProjectRef}`);
}

if (warnings.length > 0) {
  console.log('');
  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
}

if (issues.length > 0) {
  console.log('');
  for (const issue of issues) {
    console.error(`Error: ${issue}`);
  }

  process.exit(1);
}

console.log('');
console.log('Supabase configuration looks ready for chat features.');