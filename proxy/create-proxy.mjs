import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

export const API_CONTEXT = '^/api(?:/|\\?|$)';

const PROXY_ENVIRONMENTS = new Set(['dev', 'staging', 'prod']);

function assertProxyEnvironment(name) {
  if (!PROXY_ENVIRONMENTS.has(name)) {
    throw new Error(`Unsupported proxy environment: ${String(name)}`);
  }
}

function parseTimeout(value) {
  if (value == null || value === '') {
    return 30_000;
  }

  const timeout = Number(value);

  if (!Number.isInteger(timeout) || timeout < 1_000 || timeout > 120_000) {
    throw new Error('API_PROXY_TIMEOUT_MS must be an integer ' + 'between 1000 and 120000.');
  }

  return timeout;
}

function validateAllowedHost(target, settings) {
  const raw = settings.API_PROXY_ALLOWED_HOSTS;

  if (!raw) {
    return;
  }

  const allowed = new Set(
    raw
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );

  if (!allowed.has(target.hostname.toLowerCase())) {
    throw new Error(`API proxy target host "${target.hostname}" is not allowed.`);
  }
}

function getSafeRequestPath(request) {
  try {
    return new URL(request.url ?? '/', 'http://proxy.local').pathname;
  } catch {
    return '/';
  }
}

export function readProxyEnvironment(name) {
  assertProxyEnvironment(name);

  const file = new URL(`../.env.${name}.local`, import.meta.url);

  let local = {};

  try {
    local = parseEnv(readFileSync(file, 'utf8'));
  } catch (error) {
    if (!error || typeof error !== 'object' || error.code !== 'ENOENT') {
      throw error;
    }
  }

  return {
    API_PROXY_TARGET: process.env.API_PROXY_TARGET ?? local.API_PROXY_TARGET,

    API_PROXY_TIMEOUT_MS: process.env.API_PROXY_TIMEOUT_MS ?? local.API_PROXY_TIMEOUT_MS,

    API_PROXY_ALLOWED_HOSTS: process.env.API_PROXY_ALLOWED_HOSTS ?? local.API_PROXY_ALLOWED_HOSTS,
  };
}

export function createProxy(name, settings) {
  assertProxyEnvironment(name);

  settings ??= readProxyEnvironment(name);

  const value = settings.API_PROXY_TARGET ?? (name === 'dev' ? 'http://localhost:3300' : '');

  let target;

  try {
    target = new URL(value);
  } catch {
    throw new Error(
      `Set API_PROXY_TARGET to an upstream origin ` + `in .env.${name}.local or the shell.`,
    );
  }

  if (
    !['http:', 'https:'].includes(target.protocol) ||
    target.username ||
    target.password ||
    target.pathname !== '/' ||
    target.search ||
    target.hash
  ) {
    throw new Error(
      'API_PROXY_TARGET must be an HTTP(S) origin ' +
        'without credentials, a path, query, or fragment. ' +
        'Do not append /api/v1.',
    );
  }

  if (name !== 'dev' && target.protocol !== 'https:') {
    throw new Error('Staging and prod CLI proxies require an HTTPS upstream.');
  }

  validateAllowedHost(target, settings);

  const timeout = parseTimeout(settings.API_PROXY_TIMEOUT_MS);

  return {
    [API_CONTEXT]: {
      target: target.origin,

      changeOrigin: true,
      secure: true,

      ws: false,
      followRedirects: false,

      timeout,
      proxyTimeout: timeout,

      configure(proxy) {
        proxy.prependListener('error', (error, request, response) => {
          console.error('[API Proxy]', {
            code: error?.code ?? 'UNKNOWN',
            method: request?.method,
            path: getSafeRequestPath(request),
            upstream: target.origin,
          });

          if (
            !response ||
            !('writeHead' in response) ||
            response.headersSent ||
            response.writableEnded ||
            response.destroyed
          ) {
            return;
          }

          const isTimeout = ['ETIMEDOUT', 'ESOCKETTIMEDOUT'].includes(error?.code);

          response.writeHead(isTimeout ? 504 : 502, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
          });

          response.end(
            JSON.stringify({
              error: isTimeout ? 'api_gateway_timeout' : 'api_upstream_unavailable',
            }),
          );
        });
      },
    },
  };
}
