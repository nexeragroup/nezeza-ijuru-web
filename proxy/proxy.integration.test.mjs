import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');

const angularCli = join(projectRoot, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function listen(server) {
  server.listen(0, '127.0.0.1');

  await once(server, 'listening');

  const address = server.address();

  assert.ok(address && typeof address === 'object');

  return address.port;
}

async function getFreePort() {
  const server = createNetServer();

  const port = await listen(server);

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  return port;
}

async function closeServer(server) {
  if (!server.listening) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function stopProcess(child) {
  if (child.exitCode !== null) {
    return;
  }

  child.kill('SIGTERM');

  const exited = await Promise.race([
    once(child, 'exit').then(() => true),
    delay(5_000).then(() => false),
  ]);

  if (!exited) {
    child.kill('SIGKILL');

    await once(child, 'exit');
  }
}

async function waitForAngular(url, child, getLogs, timeoutMs = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Angular dev server exited early.\n\n${getLogs()}`);
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(1_500),
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Expected while Angular is still compiling.
    }

    await delay(250);
  }

  throw new Error(`Angular dev server did not become ready within ${timeoutMs}ms.\n\n${getLogs()}`);
}

async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

test(
  'Angular CLI proxies /api requests to the configured backend',
  {
    timeout: 90_000,
  },
  async (t) => {
    let upstreamRequestCount = 0;
    let apiaryRequestCount = 0;

    const upstream = createServer(async (request, response) => {
      upstreamRequestCount++;

      if (request.url?.startsWith('/apiary')) {
        apiaryRequestCount++;
      }

      if (request.url === '/api/v1/ready') {
        response.writeHead(200, {
          'Content-Type': 'application/json',
        });

        response.end(
          JSON.stringify({
            ready: true,
          }),
        );

        return;
      }

      if (request.url === '/api/v1/client-error') {
        response.writeHead(400, {
          'Content-Type': 'application/json',
        });

        response.end(
          JSON.stringify({
            error: 'validation_failed',
          }),
        );

        return;
      }

      if (request.url === '/api/v1/server-error') {
        response.writeHead(500, {
          'Content-Type': 'application/json',
        });

        response.end(
          JSON.stringify({
            error: 'internal_error',
          }),
        );

        return;
      }

      const body = await readBody(request);

      response.writeHead(200, {
        'Content-Type': 'application/json',
      });

      response.end(
        JSON.stringify({
          method: request.method,
          url: request.url,
          authorization: request.headers.authorization ?? null,
          contentType: request.headers['content-type'] ?? null,
          body,
        }),
      );
    });

    const upstreamPort = await listen(upstream);

    t.after(async () => {
      await closeServer(upstream);
    });

    const angularPort = await getFreePort();

    const target = `http://127.0.0.1:${upstreamPort}`;

    let stdout = '';
    let stderr = '';

    const angular = spawn(
      process.execPath,
      [
        angularCli,
        'serve',
        '--configuration',
        'dev',
        '--host',
        '127.0.0.1',
        '--port',
        String(angularPort),
      ],
      {
        cwd: projectRoot,

        env: {
          ...process.env,

          // Shell variables must override
          // .env.dev.local.
          API_PROXY_TARGET: target,
        },

        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    angular.stdout.setEncoding('utf8');

    angular.stderr.setEncoding('utf8');

    angular.stdout.on('data', (chunk) => {
      stdout += chunk;
    });

    angular.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    const getLogs = () => ['--- stdout ---', stdout, '--- stderr ---', stderr].join('\n');

    t.after(async () => {
      await stopProcess(angular);
    });

    const baseUrl = `http://127.0.0.1:${angularPort}`;

    await waitForAngular(`${baseUrl}/api/v1/ready`, angular, getLogs);

    /*
     * Verify method, path, query,
     * Authorization header, content type,
     * and request body are forwarded.
     */
    const payload = {
      name: 'Proxy Test',
      active: true,
    };

    const response = await fetch(`${baseUrl}/api/v1/users?active=true&page=2`, {
      method: 'POST',

      headers: {
        Authorization: 'Bearer integration-test-token',

        'Content-Type': 'application/json',
      },

      body: JSON.stringify(payload),
    });

    assert.equal(response.status, 200);

    const data = await response.json();

    assert.equal(data.method, 'POST');

    assert.equal(data.url, '/api/v1/users?active=true&page=2');

    assert.equal(data.authorization, 'Bearer integration-test-token');

    assert.match(data.contentType, /^application\/json/);

    assert.deepEqual(JSON.parse(data.body), payload);

    /*
     * Verify backend HTTP errors pass through
     * rather than becoming proxy 502 errors.
     */
    const badRequest = await fetch(`${baseUrl}/api/v1/client-error`);

    assert.equal(badRequest.status, 400);

    assert.deepEqual(await badRequest.json(), {
      error: 'validation_failed',
    });

    const serverError = await fetch(`${baseUrl}/api/v1/server-error`);

    assert.equal(serverError.status, 500);

    assert.deepEqual(await serverError.json(), {
      error: 'internal_error',
    });

    /*
     * Verify the API boundary does not
     * accidentally proxy /apiary.
     *
     * Angular may return its application shell
     * for this URL; what matters is that our
     * upstream never receives it.
     */
    const beforeApiary = upstreamRequestCount;

    await fetch(`${baseUrl}/apiary`);

    await delay(100);

    assert.equal(apiaryRequestCount, 0);

    assert.equal(upstreamRequestCount, beforeApiary);

    /*
     * Stop the upstream to verify that the
     * proxy converts connection failures into
     * our sanitized 502 response.
     */
    await closeServer(upstream);

    const unavailable = await fetch(`${baseUrl}/api/v1/upstream-unavailable`);

    assert.equal(unavailable.status, 502);

    assert.match(unavailable.headers.get('content-type') ?? '', /^application\/json/);

    assert.equal(unavailable.headers.get('cache-control'), 'no-store');

    const unavailableBody = await unavailable.json();

    assert.deepEqual(unavailableBody, {
      error: 'api_upstream_unavailable',
    });
  },
);
