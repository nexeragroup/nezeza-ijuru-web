#!/usr/bin/env bash
set -Eeuo pipefail

IMAGE_NAME_VALUE="${1:?image required}"
IMAGE_TAG_VALUE="${2:?immutable image tag required}"
COMPOSE_FILE="compose.production.yml"

[[ "${IMAGE_NAME_VALUE}" =~ ^ghcr\.io/[a-z0-9._/-]+$ ]]
[[ "${IMAGE_TAG_VALUE}" =~ ^sha-[a-f0-9]{40}$ ]]

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${DEPLOY_DIR}"

test -s runtime.env
chmod 600 runtime.env
export IMAGE_NAME="${IMAGE_NAME_VALUE}"
export IMAGE_TAG="${IMAGE_TAG_VALUE}"

compose() {
  docker compose --env-file runtime.env -f "${COMPOSE_FILE}" "$@"
}

compose config --quiet
compose pull web
compose up -d --wait --wait-timeout 120 web
curl --fail --silent --show-error --max-time 10 http://127.0.0.1:10301/health >/dev/null

echo "Nezeza Ijuru web deployed and health verified on host port 10301."
