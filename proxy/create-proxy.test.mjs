import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';

import { API_CONTEXT, createProxy } from './create-proxy.mjs';

/**
 * Return the /api proxy rule and verify that createProxy()
 * produced the expected top-level configuration.
 */
function getApiProxyRule(name = 'dev', settings = {}) {
  const config = createProxy(name, settings);

  assert.deepEqual(Object.keys(config), [API_CONTEXT]);

  return config[API_CONTEXT];
}

/**
 * Small ServerResponse-like object used to test the proxy
 * error handler without starting an HTTP server.
 */
class FakeResponse {
  headersSent = false;
  writableEnded = false;
  destroyed = false;

  statusCode = undefined;
  headers = {};
  body = '';

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.headersSent = true;
  }

  end(body = '') {
    this.body = body;
    this.writableEnded = true;
  }
}

test('API_CONTEXT matches valid API routes', () => {
  const pattern = new RegExp(API_CONTEXT);

  const valid = [
    '/api',
    '/api/',
    '/api/v1',
    '/api/v1/users',
    '/api/v1/users/123',
    '/api?page=1',
    '/api/v1/users?active=true',
  ];

  for (const value of valid) {
    assert.equal(pattern.test(value), true, `Expected "${value}" to match`);
  }
});

test('API_CONTEXT rejects non-API prefixes', () => {
  const pattern = new RegExp(API_CONTEXT);

  const invalid = ['/', '/apis', '/apiary', '/api-v2', '/apiv1', '/application'];

  for (const value of invalid) {
    assert.equal(pattern.test(value), false, `Expected "${value}" not to match`);
  }
});

test('dev defaults to the NestJS development port', () => {
  const proxy = getApiProxyRule('dev', {});

  assert.equal(proxy.target, 'http://localhost:3300');
});

test('uses API_PROXY_TARGET when provided', () => {
  const proxy = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://127.0.0.1:4000',
  });

  assert.equal(proxy.target, 'http://127.0.0.1:4000');
});

test('accepts HTTPS targets for staging', () => {
  const proxy = getApiProxyRule('staging', {
      API_PROXY_TARGET: 'https://api.staging.nezezaijuru.org',
  });

  assert.equal(proxy.target, 'https://api.staging.nezezaijuru.org');
});

test('accepts HTTPS targets for prod', () => {
  const proxy = getApiProxyRule('prod', {
      API_PROXY_TARGET: 'https://api.nezezaijuru.org',
  });

  assert.equal(proxy.target, 'https://api.nezezaijuru.org');
});

test('rejects unsupported environments', () => {
  assert.throws(() => createProxy('qa', {}), /Unsupported proxy environment/i);

  assert.throws(() => createProxy('development', {}), /Unsupported proxy environment/i);

  assert.throws(() => createProxy('production', {}), /Unsupported proxy environment/i);
});

test('staging rejects HTTP upstreams', () => {
  assert.throws(
    () =>
      createProxy('staging', {
        API_PROXY_TARGET: 'http://api.staging.nezezaijuru.org',
      }),
    /HTTPS upstream/i,
  );
});

test('prod rejects HTTP upstreams', () => {
  assert.throws(
    () =>
      createProxy('prod', {
        API_PROXY_TARGET: 'http://api.nezezaijuru.org',
      }),
    /HTTPS upstream/i,
  );
});

test('rejects targets containing a path', () => {
  assert.throws(
    () =>
      createProxy('dev', {
        API_PROXY_TARGET: 'http://localhost:3000/api/v1',
      }),
    /without credentials, a path, query, or fragment/i,
  );
});

test('rejects targets containing credentials', () => {
  assert.throws(
    () =>
      createProxy('dev', {
        API_PROXY_TARGET: 'http://user:password@localhost:3000',
      }),
    /without credentials, a path, query, or fragment/i,
  );
});

test('rejects targets containing query parameters', () => {
  assert.throws(
    () =>
      createProxy('dev', {
        API_PROXY_TARGET: 'http://localhost:3000?test=true',
      }),
    /without credentials, a path, query, or fragment/i,
  );
});

test('rejects targets containing fragments', () => {
  assert.throws(
    () =>
      createProxy('dev', {
        API_PROXY_TARGET: 'http://localhost:3000#fragment',
      }),
    /without credentials, a path, query, or fragment/i,
  );
});

test('rejects unsupported protocols', () => {
  assert.throws(
    () =>
      createProxy('dev', {
        API_PROXY_TARGET: 'ftp://localhost:3000',
      }),
    /HTTP\(S\) origin/i,
  );
});

test('rejects malformed targets', () => {
  assert.throws(
    () =>
      createProxy('dev', {
        API_PROXY_TARGET: 'not-a-valid-url',
      }),
    /Set API_PROXY_TARGET/i,
  );
});

test('proxy security defaults are correct', () => {
  const proxy = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://localhost:3000',
  });

  assert.equal(proxy.changeOrigin, true);
  assert.equal(proxy.secure, true);
  assert.equal(proxy.ws, false);
  assert.equal(proxy.followRedirects, false);
});

test('proxy timeout defaults are 30 seconds', () => {
  const proxy = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://localhost:3000',
  });

  assert.equal(proxy.timeout, 30_000);
  assert.equal(proxy.proxyTimeout, 30_000);
});

test('proxy exposes a configure callback', () => {
  const proxy = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://localhost:3000',
  });

  assert.equal(typeof proxy.configure, 'function');
});

test('connection failures return 502 without exposing upstream error', () => {
  const proxyConfig = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://localhost:3000',
  });

  const proxy = new EventEmitter();

  proxyConfig.configure(proxy);

  const response = new FakeResponse();

  const error = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:3000'), {
    code: 'ECONNREFUSED',
  });

  proxy.emit('error', error, {}, response);

  assert.equal(response.statusCode, 502);

  assert.equal(response.headers['Cache-Control'], 'no-store');

  assert.match(response.headers['Content-Type'], /^application\/json/);

  assert.deepEqual(JSON.parse(response.body), {
    error: 'api_upstream_unavailable',
  });

  assert.doesNotMatch(response.body, /ECONNREFUSED/);

  assert.doesNotMatch(response.body, /127\.0\.0\.1/);
});

test('ETIMEDOUT returns 504', () => {
  const proxyConfig = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://localhost:3000',
  });

  const proxy = new EventEmitter();

  proxyConfig.configure(proxy);

  const response = new FakeResponse();

  const error = Object.assign(new Error('request timed out'), {
    code: 'ETIMEDOUT',
  });

  proxy.emit('error', error, {}, response);

  assert.equal(response.statusCode, 504);

  assert.deepEqual(JSON.parse(response.body), {
    error: 'api_gateway_timeout',
  });
});

test('ESOCKETTIMEDOUT returns 504', () => {
  const proxyConfig = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://localhost:3000',
  });

  const proxy = new EventEmitter();

  proxyConfig.configure(proxy);

  const response = new FakeResponse();

  const error = Object.assign(new Error('socket timed out'), {
    code: 'ESOCKETTIMEDOUT',
  });

  proxy.emit('error', error, {}, response);

  assert.equal(response.statusCode, 504);

  assert.deepEqual(JSON.parse(response.body), {
    error: 'api_gateway_timeout',
  });
});

test('error handler does not write to an already-ended response', () => {
  const proxyConfig = getApiProxyRule('dev', {
    API_PROXY_TARGET: 'http://localhost:3000',
  });

  const proxy = new EventEmitter();

  proxyConfig.configure(proxy);

  const response = new FakeResponse();

  response.writableEnded = true;

  const error = Object.assign(new Error('connection refused'), {
    code: 'ECONNREFUSED',
  });

  proxy.emit('error', error, {}, response);

  assert.equal(response.statusCode, undefined);

  assert.equal(response.body, '');
});
