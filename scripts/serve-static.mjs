import express from 'express';
import { join } from 'node:path';

const app = express();
const staticRoot = join(process.cwd(), 'dist/web/static');
const port = Number(process.env.PORT || 4200);
const host = process.env.HOST || '0.0.0.0';
const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
const indexable = process.env.ROBOTS_INDEXABLE === 'true';

app.get('/health', (_req, res) => res.type('text').send('ok'));

app.get('/robots.txt', (_req, res) => {
  if (!indexable) return res.type('text').send('User-agent: *\nDisallow: /\n');
  return res.type('text').send(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req, res, next) => {
  if (!indexable) return res.status(404).type('text').send('Not Found');
  return res.sendFile(join(staticRoot, 'sitemap.xml'), (error) => error && next(error));
});

app.use(express.static(staticRoot, { maxAge: '1y', redirect: false }));
app.use((req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method) || !req.accepts('html')) return next();
  return res.sendFile(join(staticRoot, 'index.html'));
});

app.listen(port, host, (error) => {
  if (error) throw error;
  console.log(`Static web app listening on http://${host}:${port}`);
});
