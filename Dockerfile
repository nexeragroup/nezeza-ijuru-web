# syntax=docker/dockerfile:1.7

FROM node:24.21.0-bookworm-slim AS dependencies

WORKDIR /app

RUN npm install --global pnpm@12.3.4

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS build

ARG BUILD_CONFIGURATION=prod
COPY . .

RUN case "${BUILD_CONFIGURATION}" in staging|prod) ;; *) echo "Unsupported Angular configuration: ${BUILD_CONFIGURATION}" >&2; exit 1 ;; esac \
  && pnpm build:${BUILD_CONFIGURATION}:ssr \
  && pnpm prune --prod

FROM node:24.21.0-bookworm-slim AS runtime

WORKDIR /app

ARG BUILD_CONFIGURATION=prod

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4200 \
    BUILD_CONFIGURATION=${BUILD_CONFIGURATION}

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist/web/${BUILD_CONFIGURATION}/ssr ./dist/web/${BUILD_CONFIGURATION}/ssr

USER node

EXPOSE 4200
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4200/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["sh", "-c", "node dist/web/${BUILD_CONFIGURATION}/ssr/server/server.mjs"]
