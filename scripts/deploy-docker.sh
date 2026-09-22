#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
branch="$(git -C "$root" branch --show-current)"

case "$branch" in
  staging)
    compose_file="docker-compose.staging.yml"
    env_file=".env.staging"
    project="nezeza-web-staging"
    ;;
  production)
    compose_file="docker-compose.production.yml"
    env_file=".env.prod"
    project="nezeza-web-production"
    ;;
  *)
    echo "Refusing Docker deployment from branch '$branch'; use staging or production." >&2
    exit 1
    ;;
esac

exec docker compose \
  --env-file "$root/$env_file" \
  -f "$root/$compose_file" \
  -p "$project" \
  up -d --build
