# Nezeza Ijuru web

Angular 22 application with production SSR, staging CSR, environment-specific API configuration, and the same Docker/proxy layout used by the Control app.

## Development

Use Node.js 24.21.0 from `.nvmrc`, then install dependencies:

```bash
pnpm install --frozen-lockfile
```

Start the Angular development server:

```bash
pnpm start:dev
```

Open `http://localhost:4200/`.

Development API requests under `/api` use the local Angular proxy and default to `http://localhost:3300`. Override the origin in `.env.dev.local`.

For staging and production local runs, the matching `.env.staging` and `.env.prod` files generate the browser environment from `API_PROXY_TARGET`:

```bash
pnpm start:staging
pnpm start:prod
```

Staging uses CSR. Production uses SSR. For local development SSR, set `SSR_API_BASE_URL` to the API origin when it is not available at the app origin:

```bash
SSR_API_BASE_URL=http://localhost:3300/api/v1 pnpm start:dev:ssr
```

## Environment builds

```bash
pnpm build:dev
pnpm build:staging
pnpm build:prod
```

Staging uses `https://staging.nezezaijuru.org`; production uses `https://nezezaijuru.org`.

## Docker deployment

The Docker image builds staging as a static CSR site and production as an SSR site. Both listen on port `4200` inside the container.

```bash
pnpm docker:staging
pnpm docker:production
pnpm docker:deploy
```

The container publishes staging on `127.0.0.1:10302` and production on `127.0.0.1:10301`. The host edge server can route the final web domains to those loopback ports.

The branch-aware deploy script accepts only `staging` and `production` branches. It reads `.env.staging` or `.env.prod` and runs the matching Compose file.

## Production SSR

Run the generated SSR server directly when needed:

```bash
SSR_API_BASE_URL=https://api.nezezaijuru.org/api/v1 \
  SITE_URL=https://nezezaijuru.org \
  ROBOTS_INDEXABLE=true \
  PORT=4200 \
  pnpm serve:prod:ssr
```

`SSR_API_BASE_URL` is required by the production SSR runtime. The browser uses the generated API URL from the selected environment file.

## Checks

```bash
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm exec ngc -p tsconfig.app.json --noEmit
pnpm test
```

Angular CLI documentation is available at https://angular.dev/tools/cli.
