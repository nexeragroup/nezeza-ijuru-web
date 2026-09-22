# syntax=docker/dockerfile:1.7

FROM node:24.21.0-bookworm-slim AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG CONFIGURATION=prod
ARG API_PROXY_TARGET
ARG SITE_URL
ARG ROBOTS_INDEXABLE
ENV API_PROXY_TARGET=${API_PROXY_TARGET} \
    SITE_URL=${SITE_URL} \
    ROBOTS_INDEXABLE=${ROBOTS_INDEXABLE}

RUN node scripts/generate-environment.mjs "${CONFIGURATION}" \
  && pnpm exec ng build --configuration="${CONFIGURATION}" --no-progress \
  && if [ "${CONFIGURATION}" = "staging" ]; then \
       mkdir -p /app/runtime/static \
       && cp -a dist/web/staging/. /app/runtime/static/; \
     else \
       mkdir -p /app/runtime/ssr \
       && cp -a dist/web/prod/ssr/. /app/runtime/ssr/; \
     fi \
  && pnpm prune --prod

FROM node:24.21.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4200
ARG CONFIGURATION=prod
ENV WEB_RUNTIME_MODE=${CONFIGURATION}

COPY package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/runtime ./dist/web
COPY scripts/serve-static.mjs ./scripts/serve-static.mjs

USER node
EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||4200)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["sh", "-c", "if [ \"$WEB_RUNTIME_MODE\" = staging ]; then exec node scripts/serve-static.mjs; else exec node dist/web/ssr/server/server.mjs; fi"]
