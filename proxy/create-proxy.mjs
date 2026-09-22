import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_PATH = '^/api(?:/|\\?|$)';

export function createProxy(environment) {
  const localEnvironment = readLocalEnvironment(environment);
  const target = validateTarget(
    process.env.API_PROXY_TARGET ||
      localEnvironment.API_PROXY_TARGET ||
      (environment === 'dev' ? 'http://localhost:3300' : ''),
    environment,
  );
  const timeout = readTimeout(process.env.API_PROXY_TIMEOUT_MS || localEnvironment.API_PROXY_TIMEOUT_MS);

  return {
    [API_PATH]: {
      target,
      changeOrigin: true,
      secure: true,
      logLevel: 'warn',
      proxyTimeout: timeout,
      timeout,
    },
  };
}

function readLocalEnvironment(environment) {
  const file = resolve(process.cwd(), `.env.${environment}.local`);
  if (!existsSync(file)) return {};

  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z][A-Z0-9_]*)=(.*)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/^(['"])(.*)\1$/, '$2')]),
  );
}

function validateTarget(value, environment) {
  let target;

  try {
    target = new URL(value);
  } catch {
    throw new Error(`API_PROXY_TARGET must be an absolute origin for ${environment}.`);
  }

  if (
    !['http:', 'https:'].includes(target.protocol) ||
    target.username ||
    target.password ||
    target.pathname !== '/' ||
    target.search ||
    target.hash
  ) {
    throw new Error('API_PROXY_TARGET must contain only an http(s) origin.');
  }

  if (environment !== 'dev' && target.protocol !== 'https:') {
    throw new Error(`API_PROXY_TARGET must use HTTPS for ${environment}.`);
  }

  return target.origin;
}

function readTimeout(rawValue) {
  const value = Number(rawValue || 30_000);
  return Number.isFinite(value) && value > 0 ? value : 30_000;
}
