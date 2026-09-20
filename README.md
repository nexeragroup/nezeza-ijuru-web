# Nezeza Ijuru web

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Development

Use Node.js 24.21.0 (`.nvmrc` is included) before installing dependencies.

To start a local development server, run:

```bash
pnpm start:dev
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

For SSR development, set `SSR_API_BASE_URL` when the Node renderer must call an API origin that is not available at the local fallback `http://localhost:3300/api/v1`, then run:

```bash
SSR_API_BASE_URL=http://localhost:3300/api/v1 pnpm start:dev:ssr
```

## Production SSR

The production build uses request-time Angular SSR so conference, program, and media data can be rendered into the HTML returned to crawlers. Build and run the generated Node server with an absolute API URL:

```bash
pnpm install --frozen-lockfile
pnpm build:prod:ssr
SSR_API_BASE_URL=https://api.nezezaijuru.org/api/v1 \
  SITE_URL=https://nezezaijuru.org \
  ROBOTS_INDEXABLE=true \
  PORT=4000 \
  pnpm serve:prod:ssr
```

`SSR_API_BASE_URL` must be the real NestJS origin. If the API is reverse-proxied under the same public domain, use `https://nezezaijuru.org/api/v1` instead. The browser uses the same-origin `/api/v1` path, so the edge proxy must route that path to NestJS and all other application paths to the SSR Node process.

For staging, use the staging API and site origins and leave `ROBOTS_INDEXABLE=false`.

Recommended edge routing:

- `https://nezezaijuru.org/api/*` → NestJS API
- `https://nezezaijuru.org/*` → SSR Node server on port `4000`
- `https://www.nezezaijuru.org/*` → redirect to `https://nezezaijuru.org/*`

Set DNS A/AAAA records and TLS certificates for both `nezezaijuru.org` and `www.nezezaijuru.org` at the hosting provider. The Angular app cannot create DNS or certificates itself.

## Docker deployment

The Docker image builds the SSR server for one Angular configuration and listens on port `4200` inside the container. Docker publishes it on host port `10301`, so the reverse proxy should forward each web hostname to `127.0.0.1:10301`.

Build locally when needed:

```bash
docker build --build-arg BUILD_CONFIGURATION=staging -t nezeza-ijuru-web:staging .
docker build --build-arg BUILD_CONFIGURATION=prod -t nezeza-ijuru-web:production .
```

The compose files expect a server-side `runtime.env` file and an immutable image reference:

```bash
cp .env.staging.example runtime.env
IMAGE_NAME=nezeza-ijuru-web IMAGE_TAG=staging \
  docker compose --env-file runtime.env -f compose.staging.yml up -d
```

`runtime.env` is never committed. Set `SSR_API_BASE_URL` to the API origin reachable from the server-side renderer; the browser continues to use same-origin `/api/v1` requests.

GitHub Actions uses these deployment rules:

- Pull requests to `staging`, `main`, or `production` run checks and a non-published image build.
- Pushes to `staging` build and deploy the `staging` image/configuration.
- Pushes to `main` or `production` build and deploy the `production` image/configuration.
- A manual run can select either `staging` or `production`.

Create GitHub Environments named `staging` and `production`. Each environment needs these secrets: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `GHCR_USERNAME`, and `GHCR_TOKEN`.

Set these environment variables: `WEB_SSR_API_BASE_URL` and `WEB_SITE_URL` are required. `WEB_ROBOTS_INDEXABLE` should be `false` for staging and `true` for production. `WEB_DEPLOY_PATH` defaults to `/home/yves/nezeza-ijuru/client`; `SSH_PORT` defaults to `22`.

The deployment user must be able to write that directory, run Docker Compose, and pull the private GHCR image. The host must have port `10301` available. After staging is verified, promote by merging or pushing the same changes to the production branch/environment.

## Building

To build the project run:

```bash
pnpm build:prod:ssr
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
