import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function resolveApiBaseUrl(apiOrigin) {
  let target;

  try {
    target = new URL(apiOrigin);
  } catch {
    throw new Error('API_PROXY_TARGET must be an absolute origin only.');
  }

  if (
    !['http:', 'https:'].includes(target.protocol) ||
    target.username ||
    target.password ||
    target.pathname !== '/' ||
    target.search ||
    target.hash
  ) {
    throw new Error('API_PROXY_TARGET must contain an absolute origin only.');
  }

  return `${target.origin}/api/v1`;
}

function resolveSiteUrl(siteUrl) {
  let target;

  try {
    target = new URL(siteUrl);
  } catch {
    throw new Error('SITE_URL must be an absolute HTTP(S) URL.');
  }

  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.search || target.hash) {
    throw new Error('SITE_URL must be an absolute HTTP(S) URL without credentials, query, or fragment.');
  }

  return target.origin;
}

export function createEnvironmentSource(name, apiOrigin, siteUrl, indexable) {
  return `import type { AppEnvironment } from '../environment.model';

export const environment: AppEnvironment = {
  name: '${name}',
  production: ${name !== 'staging'},
  indexable: ${indexable},
  siteUrl: '${resolveSiteUrl(siteUrl)}',
  socialImagePath: '/brand/logos/logo-primary.png',
  apiBaseUrl: '${resolveApiBaseUrl(apiOrigin)}',
} as const satisfies AppEnvironment;
`;
}

function createIndexSource(siteUrl, indexable) {
  return readFileSync(resolve(root, 'src/index.html'), 'utf8')
    .replaceAll('https://nezezaijuru.org', siteUrl)
    .replace(
      /<meta name="robots" content="[^"]*" \/>/,
      `<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}" />`,
    );
}

export function generateEnvironment(name) {
  if (!['prod', 'staging'].includes(name)) {
    throw new Error(`Unsupported build environment: ${name}`);
  }

  const envFile = resolve(root, `.env.${name}`);
  if (existsSync(envFile)) process.loadEnvFile(envFile);

  const apiOrigin = process.env.API_PROXY_TARGET;
  const siteUrl = process.env.SITE_URL;
  const indexable = process.env.ROBOTS_INDEXABLE === 'true';

  if (!apiOrigin) throw new Error(`${envFile} must define API_PROXY_TARGET.`);
  if (!siteUrl) throw new Error(`${envFile} must define SITE_URL.`);

  const outputFile = resolve(root, `src/environments/generated/environment.${name}.ts`);
  const siteOrigin = resolveSiteUrl(siteUrl);
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, createEnvironmentSource(name, apiOrigin, siteUrl, indexable));
  writeFileSync(resolve(root, `src/environments/generated/index.${name}.html`), createIndexSource(siteOrigin, indexable));
  return outputFile;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateEnvironment(process.argv[2]);
}
