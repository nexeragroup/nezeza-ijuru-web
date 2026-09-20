import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');
const siteOrigin = process.env['SITE_URL']?.replace(/\/+$/, '') || environment.siteUrl;
const robotsIndexable =
  process.env['ROBOTS_INDEXABLE'] === 'true' ||
  (process.env['ROBOTS_INDEXABLE'] === undefined && environment.indexable);

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  if (!robotsIndexable) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

const escapeXml = (value: string): string =>
  value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] as string);

app.get('/robots.txt', (_req, res) => {
  const lines = ['User-agent: *', robotsIndexable ? 'Allow: /' : 'Disallow: /'];
  if (robotsIndexable) lines.push(`Sitemap: ${siteOrigin}/sitemap.xml`);
  res.type('text/plain').set('Cache-Control', 'no-cache').send(`${lines.join('\n')}\n`);
});

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const configuredApiBase = process.env['SSR_API_BASE_URL']?.trim();
    if (!configuredApiBase && process.env['NODE_ENV'] !== 'development') {
      throw new Error('SSR_API_BASE_URL is required to generate the sitemap.');
    }
    const apiBase = (configuredApiBase || 'http://localhost:3300/api/v1').replace(/\/+$/, '');
    const [response, programsResponse] = await Promise.all([
      fetch(`${apiBase}/conferences/all`, { signal: AbortSignal.timeout(3_000) }),
      fetch(`${apiBase}/programs/published`, { signal: AbortSignal.timeout(3_000) }),
    ]);
    if (!response.ok || !programsResponse.ok) throw new Error('Sitemap source request failed.');
    const conferences = await response.json() as Array<{
      id?: string;
      slug?: string;
      publicationStatus?: string;
      programs?: Array<{ id?: string }>;
    }>;
    const programs = await programsResponse.json() as Array<{ slug?: string; publicationStatus?: string }>;
    const paths = [
      '/', '/about', '/give', '/programs', '/conferences', '/media', '/media/livestream', '/contact',
      ...programs.filter((program) => program.publicationStatus === 'PUBLISHED' && program.slug)
        .map((program) => `/programs/${encodeURIComponent(program.slug!)}`),
      ...conferences
        .filter((conference) => conference.publicationStatus === 'PUBLISHED' && conference.slug)
        .flatMap((conference) => [
          `/conferences/${encodeURIComponent(conference.slug!)}`,
          ...(conference.programs ?? [])
            .filter((program) => program.id)
            .map(
              (program) =>
                `/conferences/${encodeURIComponent(conference.id ?? conference.slug!)}/program/${encodeURIComponent(program.id!)}`,
            ),
        ]),
    ];
    const urls = [...new Set(paths)]
      .map((path) => `  <url><loc>${escapeXml(`${siteOrigin}${path}`)}</loc></url>`)
      .join('\n');
    res.type('application/xml').set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    );
  } catch {
    res.status(503).type('text/plain').send('Sitemap temporarily unavailable');
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    setHeaders: (response, filePath) => {
      if (/\/(?:robots\.txt|sitemap\.xml|manifest\.webmanifest)$/.test(filePath)) {
        response.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
